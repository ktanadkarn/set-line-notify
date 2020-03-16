const request = require('request');
const cheerio = require('cheerio');

const lineToken = 'XXXXXXXXXXXXXXXXXXXXXX'; // Line notify token
const watchList = ['AOT', 'PTT', 'PTTEP']; // Add stock symbol

// Loop through stock list
watchList.forEach(st => {
  // Scraping data from Settrade website
  request('https://www.settrade.com/C04_01_stock_quote_p1.jsp?txtSymbol='+st, (error,response, html) => {
    if (!error && response.statusCode == 200 ) {
      // Manipulate data
      const $ = cheerio.load(html);
      const roundBorder = $('.round-border');
      const symbol = roundBorder.children().children().children().first().text();
      const output = roundBorder.find('h1').text().replace(/\s\s+/g, ',');
      let [price, change, percentChange] = output.split(',');

      // Prepare Line notify data
      let options = {
        method : 'POST',
        uri : 'https://notify-api.line.me/api/notify',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          bearer: lineToken, //token
        },
        form: {
          message: `SET Line Notify \nSymbol: ${symbol}\nPrice: ${price}\nChange: ${change}\n%Change: ${percentChange}`, 
        }
      }
      // POST line notify data
      request(options, (error, response, body) => {
        if (error || response.statusCode != 200) {
          console.log(response.statusCode)
        }
      });

    }

  })
});
