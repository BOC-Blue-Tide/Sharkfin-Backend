const pool = require('./db');
const axios = require('axios');
const portfolioHelper = require('./helper/portfolioHelper.js');
const getQueries = require('./db/getQueries.js');
const dbTransactions = require('./db/transactionQueries.js');
const dbFinances = require('./db/financeQueries.js');
const dbLeaderBoard = require('./db/leaderboardQueries.js')
const moment = require('moment');
require('dotenv').config();

module.exports = {
  //Portfolio routes
  getChart : async (req, res) => {
    var user_id = req.query.user_id;
    var timeWindow = req.query.timeWindow;
    const today = moment().day();
    const todayDate = moment().format().slice(0,10);
    if (today === 6) {
      var currentDate = moment().subtract(1,'days');
    } else if (today === 7) {
      var currentDate = moment().subtract(2,'days');
    } else {
      var currentDate = moment().subtract(15,'minutes');
    }
    if (currentDate.hours() > 13 && currentDate.minutes() > 0) {
      var currentDateFormated = currentDate.format().slice(0, 10) + 'T19:59:59Z';
    } else {
      var currentDateFormated = currentDate.format();
    }
    if (!user_id) {
      res.status(400);
    }
    var symbols = [];
    var numSymbols = 0;
    const symbolQuery =  'SELECT ARRAY(SELECT DISTINCT symbol FROM portfoliomins) AS symbols;';
    await pool.query(symbolQuery)
    .then((result) => {
      symbols = result.rows[0].symbols;
      numSymbols = symbols.length;
    })
    .catch((err) => {
      console.log(err);
    });

    var timeObj = portfolioHelper.handleTimeFrame(timeWindow);
    //Get Stock History from Alpaca
    var alpacaMultiBarsURL = `${process.env.ALPACA_URL}/stocks/bars`;
       var alpacaConfigs = {
      headers: {
        "Apca-Api-Key-Id": process.env.ALPACA_KEY,
        "Apca-Api-Secret-Key": process.env.ALPACA_SECRET
      },
      params: {
        'symbols': symbols.toString(),
        'timeframe': timeObj.timeFrame, //10Mins, 1Day, 1Week
        'start': timeObj.startTime, //UTC Market Opening Hour (UTC)
        'end': `${currentDateFormated}` //UTC Market Closing Hour, 15 minutes gap
      }
    };
    var alpacaResults = await axios.get(alpacaMultiBarsURL, alpacaConfigs);
    var stockHistory = alpacaResults.data.bars;
    var cleanAlpacaData = portfolioHelper.cleanAlpacaData(timeWindow, stockHistory);
    var portfolioHistory = await pool.query(getQueries.getPortfolioHistory(user_id, timeObj.sqlTF, timeWindow, todayDate));
    portfolioHistory = portfolioHistory.rows;
    var cleanedPsqlData = portfolioHelper.cleanPsqlData(portfolioHistory);
    var output = {};
    output.alpaca = cleanAlpacaData;
    output.history = cleanedPsqlData;
    var result = portfolioHelper.getChartData(output);
    res.send(result);
  },

  getAllocationAndPosition : async (req, res) => {
    if (req.params.length === 0) {
      var user_id = req.query.user_id;
    } else {
      var user_id = req.params.user_id;
    };
    var getAllocationQuery = getQueries.getAllocation(user_id);
    var endDate = moment.utc().subtract(15,'minutes').format();
    var startDate = moment.utc().subtract(1,'days').format();
    var alpacaMultiBarsURL = `${process.env.ALPACA_URL}/stocks/bars`;
    const symbolQuery =  'SELECT ARRAY(SELECT DISTINCT symbol FROM portfolioinstant) AS symbols;';
    await pool.query(symbolQuery)
    .then((result) => {
      symbols = result.rows[0].symbols;
      numSymbols = symbols.length;
    })
    .catch((err) => {
      console.log(err);
    });
    var alpacaConfigs = {
      headers: {
        "Apca-Api-Key-Id": process.env.ALPACA_KEY,
        "Apca-Api-Secret-Key": process.env.ALPACA_SECRET
      },
      params: {
        'symbols': symbols.toString(),
        'timeframe': '5Mins', //10Mins, 1Day, 1Week
        'start': startDate, //UTC Market Opening Hour (UTC)
        'end': endDate //UTC Market Closing Hour, 15 minutes gap
      }
    };
    var alpacaResults = await axios.get(alpacaMultiBarsURL, alpacaConfigs);
    alpacaResults = alpacaResults.data.bars;
    var incomingData;
    var allocationData;
    var positionData;
    await pool.query(getAllocationQuery)
    .then((result) => {
      var incomingData = result.rows;
      var allocationData = portfolioHelper.getAllocationRatio(incomingData);
      var positionData = portfolioHelper.insertPosition(alpacaResults, allocationData);
      res.status(200).send(allocationData);
    })
    .catch((err) => {
      console.log(err);
    });

  },
  //Transaction Routes
  getTransactions: (req, res) => {
    pool.query(dbTransactions.dbGetTransactions(1))
    .then((result) => {
      res.send(result.rows);
    })
    .catch((err) => {
      res.send(err);
    })
  },
  postTransaction: (req, res) => {
    // console.log(req);
    // console.log(req.body);
    pool.query(dbTransactions.dbPostTransaction(req.body))
    .then((result) => {
      console.log(result);
      res.end();
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    })
  },
  postFinances: (req, res) => {
    //TO-DO: call dbFinances.dbPostFinances
  },


  //LeaderBoard routes
  getFriendBoard: (req, res) => {
    var id = req.query.id
    console.log(id)
    pool.query(dbLeaderBoard.dbGetFriendList(id))
    .then((results) => {
      var arr = result.rows
      arr.push(id)
      return arr;
    })
    .then(async (user_arr) => {
      const result = await pool.query(dbLeaderBoard.dbGetFriendLeaderBoard(user_arr))
      res.status(200).send(result.rows);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    })
  },

  getGlobalBoard: async (req, res) => {
    await pool.query(dbLeaderBoard.dbGetGlobalLeaderBoard())
    .then((result) => {
      console.log(result)
      res.status(200).send(result.rows);
    })
    .catch((err) => {
      console.log(err);
    });
  },

  updatePerformance: async (req, res) => {
    await pool.query(dbLeaderBoard.dbPostPerformance(req.body.id, req.body.percentage))
    .then((result) => {
      console.log(result);
      res.end();
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    })
  },

  updatePicRUL: async (req, res) => {
    await pool.query(dbLeaderBoard.dbPostPicURL(req.body.id, req.body.url))
    .then((result) => {
      console.log(result);
      res.end();
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    })
  }





  // Login
  getUserByEmail: (req, res) => {
    console.log(req.query, '=====req.query');
    const text = `SELECT * FROM users WHERE email = $1`;
    const values = [req.query.email];

    pool.query(text, values)
    .then(result => {
      res.send(result);
    })
    .catch(e => console.error(e.stack))
  },

  addUser: (req, res) => {
   //console.log('======req.data', req);
    const text = `
      INSERT INTO users (username, firstname, lastname, email, profilepic_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const values = [req.body.data.username, req.body.data.firstname, req.body.data.lastname, req.body.data.email, req.body.data.picture];

    pool.query(text, values)
    .then(result => {
      console.log('addUser succeeds')
      res.send(result);
    })
    .catch(e => console.error(e.stack))
  }
}