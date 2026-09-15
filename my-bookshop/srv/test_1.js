const cds = require('@sap/cds')
const puppeteer = require("puppeteer");
const fs = require("fs");

async function runScraper() {

  let browser;   // wichtig: hier definieren, damit finally darauf zugreifen kann

  try {

    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    const page = await browser.newPage();

    const results = [];
    let array_index = [];
    let index_rein = 0;
    let seite_zahl = 0;
    let counter = 0;

    while (true) {

      if (counter === 0) {
        await page.goto(
          `https://finviz.com/screener?v=111&f=cap_largeover,idx_sp500,targetprice_a30`,
          { waitUntil: "domcontentloaded" }
        );
        counter++;
      } else {
        await page.goto(
          `https://finviz.com/screener?v=111&f=cap_largeover,idx_sp500,targetprice_a30&r=${seite_zahl}`,
          { waitUntil: "domcontentloaded" }
        );
      }

      const urls = await page.evaluate(() => {
        const links = [];
        const punkt = document.querySelectorAll("a");

        for (let i = 0; i < punkt.length; i++) {
          const element = punkt[i].href;
          if (element && element.includes("finviz.com/stock?t=") && !links.includes(element)) {
            links.push(element);
          }
        }

        return links.slice(0, 10000);
      });

      console.log("Gefundene URLs:", urls.length);

      if (urls.length === 0) {
        console.log("Keine URLs mehr → Schleife beenden");
        break;
      }

      seite_zahl += 21;

      for (let index = 0; index < urls.length; index++) {

        const firma = urls[index];

        await page.goto(firma, { waitUntil: "domcontentloaded" });

        const quotes = await page.evaluate(() => {

          const preis = document.querySelector(".quote-price")?.querySelector(".quote-price_price")?.innerText || "";
          const name = document.querySelector(".quote-header_ticker-wrapper_company a")?.innerText || "";
          const dividenden = document.querySelector(".snapshot-td-content a")?.innerText || "";

          const table = document.querySelectorAll(".table-dark-row");

          let jahr = null;
          let woche = null;
          let counter = 0;

          for (let i = 0; i < table.length; i++) {
            const label = table[i].querySelector(".snapshot-td-label")?.innerText || "";

            if (label === "Perf Year") {
              jahr = table[i].querySelector(".snapshot-td-content span")?.innerText || "";
              counter++;
            }
            if (label === "Perf Week") {
              woche = table[i].querySelector(".snapshot-td-content span")?.innerText || "";
              counter++;
            }
            if (counter === 2) break;
          }

          return { name, preis, dividenden, jahr, woche };
        });

        if (!array_index.includes(index_rein)) {
          array_index.push(index_rein);
          results.push({ ID: index_rein, ...quotes });
          index_rein++;
        }
      }
    }

    console.log("Scraper fertig, Anzahl Ergebnisse:", results.length);

    function jsonToCsv(jsonData) {
      let csv = '';
      const headers = Object.keys(jsonData[0]);
      csv += headers.join(',') + '\n';

      for (let i = 0; i < jsonData.length; i++) {
        const obj = jsonData[i];
        const values = headers.map(h => obj[h]);
        csv += values.join(',') + '\n';
      }

      return csv;
    }

    const csv_String = jsonToCsv(results);
    fs.writeFileSync("db/data/my.bookshop-Books.csv", csv_String, "utf8");

    console.log("CSV gespeichert.");

  } catch (err) {
    console.log("Fehler im Scraper:", err);
  }

  finally {
    console.log("FINALLY erreicht → Browser wird geschlossen");

    if (browser) {
      try {
        await browser.close();
        console.log("Browser wurde sauber geschlossen.");
      } catch (e) {
        console.log("Browser konnte nicht normal geschlossen werden → Force Kill");
        browser.process().kill('SIGINT');
      }
    }
  }
}

runScraper();
