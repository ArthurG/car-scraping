let { query, scrape } = require( "kijiji-scraper" );
var crypto = require("crypto");
var request = require("request");
var fs = require("fs");
var winston = require("winston");
var http = require('https'),                                                
    Stream = require('stream').Transform;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});


var titles = [];

function getOntarioCars(a){
  return new Promise(function(resolve, reject){
     query({"categoryId": "174", "locationId": "9004", "scrapeInnerAd": false}, {}, function(err, resp){
        if (err){
           reject(err);
        }
        resolve(resp);
     });
  });
}

function collectUnseenItems(newItems){
   let unseenItems = []
   let titles2 = [];
   for(var i in newItems){
      let item = newItems[i];
      
      if (!titles.includes(item.title)){
          unseenItems.push(item);
      }
      titles2.push(item.title);
   }
   title = titles2
   return Promise.resolve(unseenItems);
}

function scrapeEachCar(cars){
  for(var i in cars){
     scrapeCar(cars[i].link).then(scrapeImage).then(saveCar);
  }
}

function scrapeCar(url){
 return new Promise(function (resolve, reject){
   scrape(url, function(err, ad){
      if (err){
         reject(err);
      }
      resolve(ad);
   }); 
 });
}

function scrapeImage(car){
   return new Promise(function(resolve, reject){
     let images = car.images;
     new_images = [];
     let downloadPromise = Promise.all(images.map(download));
     downloadPromise.then(function(new_images){
       car.images = new_images;
       resolve(car);
     });
     downloadPromise.catch(reject);
   });

}

function download(uri){
  var id = crypto.randomBytes(20).toString('hex') + ".jpg";
  var filename = "photos/"+id;
  return new Promise(function (resolve, reject){
    http.request(uri, function(response) {                                        var data = new Stream();                                                    

      response.on('data', function(chunk) {                                       
        data.push(chunk);                                                         
      });                                                                         

      response.on('end', function() {                                             
        fs.writeFileSync(filename, data.read());                               
        resolve();
      });                                                                         
    }).on("error", reject).end();
  });
};

function saveCar(carData){
  logger.log({
    level: 'info',
    data: carData
  });
}

function doScrape(){
  getOntarioCars()
    .then(collectUnseenItems)
    .then(scrapeEachCar);
}

setInterval(doScrape, 3000);
/*
scrapeCar("https://www.kijiji.ca/v-cars-trucks/city-of-toronto/2014-ram-1500-sxt-quad-cab-4x4-5-7l-hemi/1336810628").then(console.log)
*/

//download('https://i.ebayimg.com/00/s/NzY4WDEwMjQ=/z/48AAAOSw-llamRwW/$_57.JPG', "hi.jpg");
