const cds = require('@sap/cds')

const express = require("express");
const puppeteer = require("puppeteer");
const app = express();

 
module.exports = cds.service.impl(async function (srv) {
 
 
  srv.on("Aktien", async (req, res) => {
    
     let browser;

  
    browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });




  const page = await browser.newPage();

  // Page mit meinen Filter in Finviz
   const results = [];
  let array_index = [];
 let index_rein = 0;
 let seite_zahl = 0;
 let counter = 0;

while (true) {
  
 //// erste Seite Unterscheidet sich immer , deswegen muss man extra noch einbauen
  if (counter === 0){
       await page.goto(
        /// ausgewälte Seite
      `https://finviz.com/screener?v=111&f=cap_largeover,idx_sp500,targetprice_a30`,
      {
        waitUntil: "domcontentloaded",
      }
    ); 
   
    counter ++;
  }
  else {
    await page.goto(
      `https://finviz.com/screener?v=111&f=cap_largeover,idx_sp500,targetprice_a30&r=${seite_zahl}`,
      {
        waitUntil: "domcontentloaded",
      }
    ); 
  }



 const urls = await page.evaluate(() => {
     
  const links = [];
        
 /// sucht alle a Elemente 
  const punkt = document.querySelectorAll("a");
    
      for (let i = 0; i < punkt.length; i++) {
     
        // guckt genau nach <a href="links" oder  <a class= "xxx"  href="links"
        const element = punkt[i].href;
            
        // && = und ( 1--> es gibt href , 2-> hat nötige Link, 3-> liegt nicht in unserem Array)
          if ( element && element.includes("finviz.com/stock?t=") && !links.includes(element) ) 
          {
              links.push(element);
          }
      }

  return links.slice(0, 10000);  // Bedrenzung 
 });

 console.log(urls);


       /// wenn Array keine Links hat (nicht gefunden)
        if (urls.length === 0) {
             break;
        }
 
  
     seite_zahl += 21;
  



    for (let index = 0; index <= urls.length - 1 ; index++) {
          
      const firma = urls[index]
     await page.goto(firma,{
    waitUntil: "domcontentloaded",
  });
   const quotes = await page.evaluate(() => {
       

      /// ? -> undefiniert zurück oder nicht existiert -> ( || = oder )
       const preis =document.querySelector(".quote-price")?.querySelector(".quote-price_price")?.innerText || "";

       //Name
       const name = document.querySelector(".quote-header_ticker-wrapper_company a")?.innerText || "";

        //Dividende
        const dividenden = document.querySelector(".snapshot-td-content a")?.innerText || "";

        // Jahr
        const table = document.querySelectorAll(".table-dark-row");

              let jahr = null;
                  let i = 0;
                  let counter = 0;
                  let woche = null;

                  while (i < table.length) {
                      const label = table[i].querySelector(".snapshot-td-label")?.innerText || "";

                      if (label === "Perf Year") {
                          jahr = table[i].querySelector(".snapshot-td-content span")?.innerText || "";
                         counter +=1;
                      }
                       if (label === "Perf Week") {
                          woche = table[i].querySelector(".snapshot-td-content span")?.innerText || "";
                          counter +=1 ;
                      }
                        if (counter === 2) {
                          break;
                      }

                      i++;
                  }
      
        

       return { name, preis, dividenden, jahr, woche };
     
    });


    //extra IDs , damit Anatationen funktionieren
    let ID = index_rein;

   if (!array_index.includes(index_rein)){
    array_index.push(index_rein)
    const result_2 = {
                ID: index_rein,
                ...quotes
                };
    index_rein = index_rein + 1;
    results.push(result_2)
    };


   
  };
   };

    console.log(results)

                      /// json in csv
                        function jsonToCsv(jsonData) {
                        let csv = '';
                        
                        // Kopfzeilen rausnehmen
                        const headers = Object.keys(jsonData[0]); ///holt alle Kopfzeilen aus dem Block 0
                        csv += headers.join(',') + '\n';   // Kommatrennung + nächste spalte /n 
                        

                             /// jsonData.length Anzahl der Blöcke
                             /// jsonData[x] - bestimmtes Block
                            ///console.log(jsonData[0][headers[1]]); holt die Werte unter bestimmten Kopfzeilen

                            //Werte holen 
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

            
        const csv_String = jsonToCsv(results);
        console.log(csv_String);


        // CSV in Datei speichern
            const fs = require("fs");
            fs.writeFileSync("db/data/my.bookshop-Books.csv", csv_String, "utf8");

      return results
        
  


 



   await browser.close();

});


});


