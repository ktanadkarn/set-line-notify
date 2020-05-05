const request = require("request");
const cheerio = require("cheerio");

const lineToken = "[ Token value ]"; // Line notify token
const watchList = ["AOT", "PTT", "PTTEP"]; // Add stock symbol

// Loop through stock list
console.time("process");
watchList.forEach((st) => {
  // Scraping data from Settrade website
  request(
    "https://www.settrade.com/C04_01_stock_quote_p1.jsp?txtSymbol=" + st,
    (error, response, html) => {
      if (!error && response.statusCode === 200) {
        // Manipulate data
        const $ = cheerio.load(html);
        const mktStatus = $("div.flex-item > div:nth-child(2) > span")
          .text()
          .trim();
        const symbol = $(
          "div.round-border >div:nth-child(1) > div:nth-child(1) > span:nth-child(1)"
        )
          .text()
          .trim();

        const price = $(
          "div.round-border > div:nth-child(1) > div.col-xs-6.col-xs-offset-6 > h1"
        )
          .text()
          .trim();
        const change = $(
          " div.round-border > div:nth-child(2) > div:nth-child(1) > h1"
        )
          .text()
          .trim();
        const percentChange = $(
          "div.round-border > div:nth-child(2) > div:nth-child(2) > h1"
        )
          .text()
          .trim();

        //Prepare Line notify data
        let options = {
          method: "POST",
          uri: "https://notify-api.line.me/api/notify",
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          auth: {
            bearer: lineToken, //token
          },
          form: {
            message: `SET Line Notify \nMarket Status: ${mktStatus}\nSymbol: ${symbol}\nPrice: ${price}\nChange: ${change}\n%Change: ${percentChange}`,
          },
        };

        //POST line notify data
        request(options, (error, response, body) => {
          if (error || response.statusCode !== 200) {
            console.log(response.statusCode);
          }
        });
      }
    }
  );
});
console.timeEnd("process");
