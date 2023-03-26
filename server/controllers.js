const pool = require('./db');
const axios = require('axios');
const portfolioHelper = require('./helper/portfolioHelper.js');
const getQueries = require('./db/getQueries.js');
const moment = require('moment');
require('dotenv').config();

module.exports = {
  getChart : async (req, res) => {
    var accountNum = req.query.accountNum;
    var timeWindow = req.query.timeWindow;
    var isDone = false;
    const today = moment().day();
    const todayDate = moment().format().slice(0,10);
    if (today === 6) {
      var currentDate = moment().subtract(1,'days');
    } else if (today === 0) {
      var currentDate = moment().subtract(2,'days');
    } else {
      var currentDate = moment().subtract(15,'minutes');
    }
    if (currentDate.hours() > 13 && currentDate.minutes() > 0) {
      var currentDateFormated = currentDate.format().slice(0, 10) + 'T19:59:59Z';
    } else {
      var currentDateFormated = currentDate.format();
    }
    if (!accountNum) {
      res.status(400);
    }
    var symbols = [];
    const symbolQuery =  `SELECT ARRAY (
      SELECT DISTINCT symbol
      FROM portfoliomins
      WHERE account = ${accountNum} AND type = 'stock')
      AS stocks,
      ARRAY (
        SELECT DISTINCT symbol
        FROM portfoliomins
        WHERE account = ${accountNum} AND type = 'crypto')
         AS cryptos;`;
    await pool.query(symbolQuery)
    .then((result) => {
      if (result.rows[0].stocks.length === 0 && result.rows[0].cryptos.length === 0) {
        res.send({});
        isDone = true;
        return;
      }
      stockSymbols = result.rows[0].stocks;
      cryptoSymbols = result.rows[0].cryptos;
    })
    .catch((err) => {
      console.log(err);
    });
    if (isDone) {
      return;
    };
    var timeObj = portfolioHelper.handleTimeFrame(timeWindow);
    var historyData = {};
    if (stockSymbols.length !== 0) {
      //Get Stock History from Alpaca
      var alpacaStockMultiBarsURL = process.env.ALPACA_STOCK_URL;
      var alpacaConfigs = {
        headers: {
          "Apca-Api-Key-Id": process.env.ALPACA_KEY,
          "Apca-Api-Secret-Key": process.env.ALPACA_SECRET
        },
        params: {
          'symbols': stockSymbols.toString(),
          'timeframe': timeObj.timeFrame, //10Mins, 1Day, 1Week
          'start': timeObj.startTime, //UTC Market Opening Hour (UTC)
          'end': `${currentDateFormated}` //UTC Market Closing Hour, 15 minutes gap
        }
      };
      await axios.get(alpacaStockMultiBarsURL, alpacaConfigs)
        .then((result) => {
          historyData = result.data.bars;
        })
        .catch((err) => {
          console.log(err);
        })
    };
    if (cryptoSymbols.length !== 0) {
      var alpacaCryptoMultiBarsURL = process.env.ALPACA_CRYPTO_URL;
      var alpacaConfigs = {
        headers: {
          "Apca-Api-Key-Id": process.env.ALPACA_KEY,
          "Apca-Api-Secret-Key": process.env.ALPACA_SECRET
        },
        params: {
          'symbols': cryptoSymbols.toString(),
          'timeframe': timeObj.timeFrame, //10Mins, 1Day, 1Week
          'start': timeObj.startTime, //UTC Market Opening Hour (UTC)
          'end': `${currentDateFormated}` //UTC Market Closing Hour, 15 minutes gap
        }
      };
      await axios.get(alpacaCryptoMultiBarsURL, alpacaConfigs)
        .then((result) => {
          var weekendExcluded = portfolioHelper.excludeWeekend(result.data.bars);
          // console.log(weekendExcluded);
          historyData = {...historyData, ...weekendExcluded};
        })
        .catch((err) => {
          console.log(err);
        })
    };
    var cleanAlpacaData = portfolioHelper.cleanAlpacaData(timeWindow, historyData);
    var portfolioHistory;
    console.log(timeObj.sqlTF);
    await pool.query(getQueries.getPortfolioHistory(accountNum, timeObj.sqlTF, timeWindow, todayDate))
      .then((result) => {
        portfolioHistory = result.rows;
      })
      .catch((err) => {
        console.log(err);
      });
    var cleanedPsqlData = portfolioHelper.cleanPsqlData(portfolioHistory);
    var output = {};
    output.alpaca = cleanAlpacaData;
    output.history = cleanedPsqlData;
    var result = portfolioHelper.getChartData(output);
    res.send(result);
  },

  getAllocationAndPosition : async (req, res) => {
    var accountNum = req.query.accountNum;
    var isDone = false;
    const today = moment().day();
    const todayDate = moment().format().slice(0,10);
    if (today === 6) {
      var startDate = moment().subtract(1,'days');
    } else if (today === 0) {
      var startDate = moment().subtract(2,'days');
    } else {
      var startDate = moment().subtract(15,'minutes');
    }
    if (startDate.hours() > 13 && startDate.minutes() > 0) {
      var startDateFormated = startDate.format().slice(0, 10) + 'T19:59:59Z';
    } else {
      var startDateFormated = startDate.format();
    }
    if (!accountNum) {
      res.status(400);
    }
    var startDataCrypto = moment.utc().subtract(21,'minutes').format();
    var endDate = moment.utc().subtract(15,'minutes').format();
    var alpacaMultiBarsURL = process.env.ALPACA_STOCK_URL;
    const symbolQuery =  `SELECT ARRAY (
      SELECT DISTINCT symbol
      FROM portfolioinstant
      WHERE account = ${accountNum} AND type = 'stock')
      AS stocks,
      ARRAY (
        SELECT DISTINCT symbol
        FROM portfolioinstant
        WHERE account = ${accountNum} AND type = 'crypto')
         AS cryptos;`;
    await pool.query(symbolQuery)
    .then((result) => {
      if (result.rows[0].stocks.length === 0 && result.rows[0].cryptos.length === 0) {
        res.send({});
        isDone = true;
        return;
      }
      stockSymbols = result.rows[0].stocks;
      cryptoSymbols = result.rows[0].cryptos;
    })
    .catch((err) => {
      console.log(err);
    });
    if (isDone) {
      return;
    };
    var alpacaResults;
    var incomingData;
    var allocationData;
    var positionData;
    if (stockSymbols.length !== 0) {
      //Get Stock History from Alpaca
      var alpacaStockMultiBarsURL = process.env.ALPACA_STOCK_URL;
      var alpacaConfigs = {
        headers: {
          "Apca-Api-Key-Id": process.env.ALPACA_KEY,
          "Apca-Api-Secret-Key": process.env.ALPACA_SECRET
        },
        params: {
          'symbols': stockSymbols.toString(),
          'timeframe': '5Min', //10Mins, 1Day, 1Week
          'start': startDateFormated, //UTC Market Opening Hour (UTC)
          'end': endDate //UTC Market Closing Hour, 15 minutes gap
        }
      };
      await axios.get(alpacaStockMultiBarsURL, alpacaConfigs)
        .then((result) => {
          alpacaResults = result.data.bars;
        })
        .catch((err) => {
          console.log(err);
        })
    };
    if (cryptoSymbols.length !== 0) {
      var alpacaCryptoMultiBarsURL = process.env.ALPACA_CRYPTO_URL;
      var alpacaConfigs = {
        headers: {
          "Apca-Api-Key-Id": process.env.ALPACA_KEY,
          "Apca-Api-Secret-Key": process.env.ALPACA_SECRET
        },
        params: {
          'symbols': cryptoSymbols.toString(),
          'timeframe': '5Min',
          'start': startDataCrypto, //UTC Market Opening Hour (UTC)
          'end': endDate //UTC Market Closing Hour, 15 minutes gap
        }
      };
      await axios.get(alpacaCryptoMultiBarsURL, alpacaConfigs)
        .then((result) => {
          alpacaResults = {...alpacaResults, ...result.data.bars};
        })
        .catch((err) => {
          console.log(err);
        })
    };
    var alloPosQuery = getQueries.getAlloPosQuery(accountNum);
    await pool.query(alloPosQuery)
    .then((result) => {
      var incomingData = result.rows;
      var allocationData = portfolioHelper.getAllocationRatio(incomingData);
      console.log(allocationData);
      var positionData = portfolioHelper.insertPosition(alpacaResults, allocationData);
      res.status(200).send(allocationData);
    })
    .catch((err) => {
      console.log(err);
    });

  }
}