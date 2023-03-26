require('dotenv').config();
const WebSocket = require('ws');
const moment = require('moment');
const socket = new WebSocket(process.env.ALPACA_WS_URL);

module.exports = {
  getChartData : function(combinedData) {
    var alpacaData = combinedData.alpaca;
    var historyData = combinedData.history;
    var output = alpacaData;
    var length = output.time.length;
    var result = new Array(length).fill(0);
    for (var key of Object.keys(historyData)) {
      for (var i = 0; i < length; i++) {
        output[key][i] = (alpacaData[key][i] - historyData[key]['avg_cost'][i]) * historyData[key]['qty'][i];
        result[i] += output[key][i];
      }
    }
    for (var i = 0; i < output.time.length; i++) {
      result[i] += historyData[key]['buy_pwr'][i];
    }
    output.timeCount = length;
    output.net = result;
    return output;
  },

  handleTimeFrame : function (timeWindow) {
    var output = {};
    var startTime = moment();
    var timeFrame;
    var sqlTF;
    if (timeWindow === '1D') {
      startTime = startTime.format().slice(0,10);
      startTime += 'T13:30:00Z';
      timeFrame = '10Min';
      sqlTF = '1 day';
    } else if (timeWindow === '1W') {
      startTime = startTime.subtract(7, 'days').format().slice(0,10);
      timeFrame = '1Day';
      sqlTF = '7.9 days';
    } else if (timeWindow === '1M') {
      startTime = startTime.subtract(1, 'months').format().slice(0,10);
      timeFrame = '1Day';
      sqlTF = '1 month';
    } else if (timeWindow === '3M') {
      startTime = startTime.subtract(3, 'months').format().slice(0,10);
      timeFrame = '1Day';
      sqlTF = '3 months';
    } else if (timeWindow === '1Y') {
      startTime = startTime.subtract(1, 'years').format().slice(0,10);
      timeFrame = '1Day';
      sqlTF = '1 year';
    } else if (timeWindow === '5Y') {
      startTime = startTime.subtract(5, 'years').format().slice(0,10);
      timeFrame = '1Week';
      sqlTF = '5 years';
    }
    output.startTime = startTime;
    output.timeFrame = timeFrame;
    output.sqlTF = sqlTF;
    return output;
  },

  cleanAlpacaData : function (timeWindow, stockHistory) {
    var timeIncluded = false;
    var output = {};
    output.time = [];
    for (var symbol of Object.keys(stockHistory)) {
      var symbolHistory = stockHistory[symbol];
      output[[symbol]] = [];
      for (var i = 0; i < symbolHistory.length; i++) {
        if (timeIncluded) {
          output[[symbol]].push(symbolHistory[i].c);
        } else {
          output[[symbol]].push(symbolHistory[i].c);
          if (timeWindow === '1D') {
            output.time.push(symbolHistory[i].t);
          } else {
            output.time.push(symbolHistory[i].t.slice(0,10));
          }
        }
      };
      timeIncluded = true;
    }
    return output;
  },

  getAllocationRatio : function (portfolioData) {
    var output = {};
    output.position = [];
    output.allocation = {};
    output.allocation.symbols = [];
    output.allocation.ratios = [];
    var totalNetWorth = 0;
    for (var i = 0; i < portfolioData.length; i++) {
      totalNetWorth += portfolioData[i].avg_cost * portfolioData[i].qty;
    }
    totalNetWorth += portfolioData[0].buy_pwr;
    var buy_pwr = portfolioData[0].buy_pwr;
    for (var j = 0; j < portfolioData.length; j++) {
      var position = {};
      output.allocation.symbols.push(portfolioData[j].symbol);
      var currTotal = parseFloat(portfolioData[j].avg_cost * portfolioData[j].qty);
      var currPer = parseFloat((currTotal/totalNetWorth * 100).toFixed(2));
      position.symbol = portfolioData[j].symbol;
      position.accountPer = parseFloat(currPer);
      position.qty = portfolioData[j].qty;
      position.avgCost = parseFloat(portfolioData[j].avg_cost);
      output.position.push(position);
      output.allocation.ratios.push(currPer);
    }
    output.totalNetWorth = parseFloat(totalNetWorth.toFixed(2));
    output.allocation.symbols.push('CASH');
    output.allocation.ratios.push(parseFloat((buy_pwr/totalNetWorth * 100).toFixed(2)));
    return output;
  },

  insertPosition : function (alpacaData, cleanedData) {
    var lastData = alpacaData;
    var position = cleanedData.position;
    for (var i = 0; i < position.length; i++) {
      var symbol = position[i].symbol;
      var length = lastData[symbol].length;
      var symbolData = lastData[symbol][length - 1];
      var lastPrice = symbolData.c;
      position[i].lastPrice = lastPrice;
      position[i].gainLossPer = parseFloat((((lastPrice - position[i].avgCost) * position[i].qty) / (position[i].avgCost * position[i].qty) * 100).toFixed(2));
      var gainLossDol = parseFloat(((lastPrice - position[i].avgCost) * position[i].qty).toFixed(2));
      position[i].gainLossDol = gainLossDol;
      cleanedData.totalNetWorth+=gainLossDol;
    }
    cleanedData.totalNetWorth = parseFloat(cleanedData.totalNetWorth.toFixed(2));
    return position;
  },

  cleanPsqlData : function(psqlData) {
    var output = {};
    for (var i = 0; i < psqlData.length; i++) {
      var currSymbol = psqlData[i].symbol;
      output[[currSymbol]] = {};
      output[[currSymbol]].time = psqlData[i].time;
      output[[currSymbol]].qty = psqlData[i].qty;
      output[[currSymbol]].avg_cost = psqlData[i].avg_cost;
      output[[currSymbol]].buy_pwr = psqlData[i].buy_pwr;
    }
    return output;
  },

  excludeWeekend : function(cryptoHistory) {
    var output = {};
    for (var symbol of Object.keys(cryptoHistory)) {
      output[[symbol]] = [];
      var symbolHistory = cryptoHistory[symbol];
      for (var i = 0; i < symbolHistory.length; i++) {
        var time = symbolHistory[i].t;
        var day = moment.utc(time).day();
        if (day !== 6 && day !== 0) {
          output[[symbol]].push(symbolHistory[i]);
        }
      }
    }
    return output;
  }
};

