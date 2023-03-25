const fs = require("fs");
const { Parser } = require("json2csv");
const moment = require('moment');
function generateMockData() {
  // const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // now - 7 days
  const startDate = moment().subtract(3, 'months').format();
  // const endDate = new Date(); // End date
  const endDate = moment();
  const interval = 1; // 1 day
  const symbols = ["AAPL", "GOOGL","TSLA", "BTC/USD", "DOGE/USD"];
  const crypto = {'BTC/USD' : 1, 'DOGE/USD' : 1};
  const accountnums = [1, 2];
  const data = [];
  var count = 0;
  // Loop through each time interval between start and end date
  for (let currentTime = moment(startDate); currentTime <= endDate; currentTime.days(currentTime.days() + interval)) {
    // Check if current time is within the specified window
    // if (currentTime.hours() >= 6 && currentTime.hours() < 13) { // 420 minutes is 7 hours (PST timezone offset)
      // generate a data point for each symbol and user ID
      symbols.forEach(symbol => {
        if (symbol in crypto) {
          var type = 'crypto';
        } else {
          var type = 'stock';
        }
        accountnums.forEach(accountnum => {
          // Generate random values for each column
          const time = currentTime.format().slice(0, 19).replace('T', ' ').toString(); // remove milliseconds
          const qty = Math.floor(Math.random() * 100) + 1; // generate a random 1 and 100
          const avg_cost = Math.floor(Math.random() * 1000) / 10; // generate a random average cost between 0 and 100.00
          const buy_pwr = 400;
          if (count > 3) {
            data.push({
              account: accountnum,
              symbol: symbol,
              type: type,
              time: time,
              qty: qty,
              avg_cost: avg_cost,
              buy_pwr: buy_pwr
            });
          }
          count++;
        });
      });
    // }
  }
  const fileName = 'daysMock.csv'
  const fields = ["account","symbol","type","time","qty","avg_cost","buy_pwr"];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(data);
  fs.writeFile(fileName, csv, function (err) {
    if (err) throw err;
    console.log(`Saved ${data.length} rows of mock data to ${fileName}`);
  });
  // return data;
}

generateMockData()