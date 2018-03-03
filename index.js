let { query, scrape } = require( "kijiji-scraper" );
var crypto = require("crypto");
var request = require("request")
var fs = require("fs")


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
   let images = car.images;
   new_images = [];
   for (var i in images){
      var id = crypto.randomBytes(20).toString('hex') + ".jpg";
      //console.log(id);
      download(images[i], "photos/"+id);
      new_images.push(id);
   }  
   car.images = new_images;
}

function download(uri, filename){
  return new Promise(function (resolve, reject){
     request.head(uri, function(err, res, body){
       if(err){
          reject(err);
       }
       request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);
     });
  });
};

function saveCar(){

}

getOntarioCars()
  .then(collectUnseenItems)
  .then(scrapeEachCar);
/*
scrapeCar("https://www.kijiji.ca/v-cars-trucks/city-of-toronto/2014-ram-1500-sxt-quad-cab-4x4-5-7l-hemi/1336810628").then(console.log)
*/

//download('https://i.ebayimg.com/00/s/NzY4WDEwMjQ=/z/48AAAOSw-llamRwW/$_57.JPG', "hi.jpg");
