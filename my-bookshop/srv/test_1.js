const cds = require('@sap/cds')
const puppeteer = require("puppeteer");
const fs = require("fs");

async function Screener() {

  let browser;  

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

        /// dadurch finde ich alle Firmen , die auf der Seite stehen 
        for (let i = 0; i < punkt.length; i++) {
          const element = punkt[i].href;
          if (element && element.includes("finviz.com/stock?t=") && !links.includes(element)) {
            links.push(element);
          }
        }

        return links.slice(0, 10000);
      });

      console.log("Gefundene URLs:", urls.length);
      
      ///falls Ende
      if (urls.length === 0) {
        console.log("Keine URLs");
        break;
      }
      
      /// auf der webseite vorgegeben
      seite_zahl += 21;

      //jeder Url untersuchen
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

          //genau was ich suche (Daten aus den Feldern)
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
       
         /// extra ID für CAP wird benötigt , um Eindeutigkeit zu haben.
        if (!array_index.includes(index_rein)) {
          array_index.push(index_rein);
          results.push({ ID: index_rein, ...quotes });
          index_rein++;
        }
      }
    }

    console.log("Anzahl Ergebnisse:", results.length);

                        function jsonToCsv(jsonData) {
                        let csv = '';
                        
                        // Kopfzeilen rausnehmen
                        const headers = Object.keys(jsonData[0]); ///holt alle Kopfzeilen aus dem Block 0
                        csv += headers.join(',') + '\n';   // Kommatrennung + nächste spalte /n 
                        
                             /// jsonData.length Anzahl der Blöcke
                            ///console.log(jsonData[0][headers[1]]); holt die Werte unter bestimmten Kopfzeilen
                           for (let i = 0; i < jsonData.length; i++) {
                              const obj = jsonData[i];
                        
                              const values = [];
                              for (let j = 0; j < headers.length; j++) {
                                  values.push(obj[headers[j]]);
                              }

                              csv += values.join(',') + '\n'; 
                          }

                        return csv;
                       }
 
     
     /// in csv reinpacken 
    const csv_String = jsonToCsv(results);
    fs.writeFileSync("db/data/my.bookshop-Books.csv", csv_String, "utf8");


    if (browser) {

        await browser.close();
        console.log("Browser ist geschlossen.");

  }
}

Screener();



