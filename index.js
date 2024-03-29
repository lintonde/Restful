'use strict';

// imports
require('dotenv').config();
const https = require('https');
const fs = require('fs').promises;
const express = require('express');
const { newMongoEvent, newMongoRest, allRests } = require("./mongo_functions");
const bodyParser = require('body-parser');
const request = require('request');
const path = require("path");
const cors = require('cors');
const app = express();
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

// app
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/www/'));
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost/', 'https://food-express.onrender.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});
app.set('views', __dirname);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors());

// Restful API
(async () => {
  try {
    const woo_api = new WooCommerceRestApi({
      url: "https://restful.co.il",
      consumerKey: process.env.CONSUMER_KEY,
      consumerSecret: process.env.CONSUMER_SECRET,
      version: "wc/v3"
    });
    woo_api._stores = {

      get_all_stores: async function () {
        let url = 'https://restful.co.il/wp-json/wcfmmp/v1/store-vendors'; // all
        request.get({
          url: url,
          json: true,
          headers: { 'User-Agent': 'request' }
        }, (err, res, data) => {
          if (err) {
            console.log('יש לך ארור יחנטריש:', err);
          } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
          } else {
            console.log(data);
            return data;
          }
        })
      },

      get_all_stores_local: async function (lat, long, radius) {
        let url = 'https://restful.co.il/wp-json/wcfmmp/v1/store-vendors?wcfmmp_radius_lat=' + lat + '&wcfmmp_radius_long=' + long + '';
        request.get({
          url: url,
          json: true,
          headers: { 'User-Agent': 'request' }
        }, (err, res, data) => {
          if (err) {
            console.log('יש לך ארור יחנטריש:', err);
          } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
          } else {
            console.log(data);
            return data;
          }
        })
      },

      get_products: async function (store_id) {
        let url = 'https://restful.co.il/wp-json/wcfmmp/v1/store-vendors/' + store_id + '/products';
        request.get({
          url: url,
          json: true,
          headers: { 'User-Agent': 'request' }
        }, (err, res, data) => {
          if (err) {
            console.log('יש לך ארור יחנטריש: ', err);
          } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
          } else {
            console.log(data);
            return data;
          }
        })
      },

      get: async function (store_id) {
        let url = 'https://restful.co.il/wp-json/wcfmmp/v1/store-vendors/' + store_id;
        request.get({
          url: url,
          json: true,
          headers: { 'User-Agent': 'request' }
        }, (err, res, data) => {
          if (err) {
            console.log('יש לך ארור יחנטריש:', err);
          } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
          } else {
            console.log(data);
            return data;
          }
        })
      }
    }
    woo_api._products = {
      items: [],
      get_all: async () => {
        return await woo_api.get("products", { per_page: 20 }).then((response) => {
          for (var i = response.data.length - 1; i >= 0; i--) {
            let imgs = [];
            let item = {};
            item.id = response.data[i]["id"];
            item.name = response.data[i]["name"];
            item.job = response.data[i]["description"];
            item.price = response.data[i]["regular_price"];
            item.wolt = 'https://wolt.co.il'; //response.data[i]["wolt"];
            item.phone = 'tel:0507606660'; //response.data[i]["wolt"];
            item.tenbis = 'https://www.10bis.co.il/next/'; //response.data[i]["tenbis"];
            item.page = 'https://restful.co.il/משייה'; //response.data[i]["tenbis"];
            item.location = 'https://www.google.com/maps/place/%D7%A4%D7%99%D7%A6%D7%94+%D7%A8%D7%95%D7%96%D7%9E%D7%A8%D7%99%D7%9F+%7C+%D7%A4%D7%99%D7%A6%D7%94+%D7%9B%D7%A9%D7%A8%D7%94+%D7%91%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91%E2%80%AD%E2%80%AD/@32.0664064,34.7830238,15z/data=!4m2!3m1!1s0x0:0x1ff261d82d28f753';
            if (response.data[i]["images"].length > 0) {
              imgs.push(response.data[i]["images"][0]["src"])
            }
            item.images = imgs;
            woo_api._products.items.push(item);
          }
          return woo_api._products.items; // [{id:0,name: 'avi',price: 50, etc..}]
        }).catch((error) => {
          console.log(error);
        });
      },

      get: async (product_id) => {
        if (!woo_api._products.length) {
          woo_api.get("products/" + product_id).then((response) => {
            console.log(response.data);
          }).catch((error) => {
            console.log(error);
          });
        }
      }
    }

    const writeProductsJson = () => {
      let url = "https://food-express.onrender.com/api/products";
      https.get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            let json = JSON.stringify(body);
            fs.writeFile('www/data.json', json, 'utf8', () => { return; });
          } catch (error) {
            console.error(error.message);
          };
        });

      }).on("error", (error) => {
        console.error(error.message);
      });
    }

    // router
    app.get("/", (req, res) => {
      res.sendFile(__dirname + '/www/index.html');
    });

    app.get("/app", (req, res) => {
      res.sendFile(__dirname + '/www/app.html');
    });

    app.get("/api/products/", (req, res) => {
      woo_api._products.items = [];
      woo_api._products.get_all().then((response) => {
        res.json(response);
      });
    });

    app.get("/api/products/local", (req, res) => {
      woo_api._products.items = [];
      let lat = '0' //'32.1643219';
      let long = '0' //'34.8727212';
      let radius = '1';
      woo_api._stores.get_all_stores_local(lat, long, radius).then((response) => {
        res.json(response);
      });
    });

    // app.get("/api/products/write", (req, res) => {
    //   writeProductsJson();
    // });

    // app.get("/api/createNewClient", async (req, res) => {
    //   /**
    //    * Create a google spreadsheet
    //    * @param {string} title Spreadsheets title
    //    * @return {string} Created spreadsheets ID
    //    */
    //   const restaurant = req.query.name;
    //   const exists = await checkIfClientExists(restaurant);
    //   if (exists != -1)
    //     res.send("Client already exists");
    //   else {
    //     await createClient(restaurant);
    //     res.send("Client's spreadsheeet created");
    //   }
    // });

    // app.get("/api/newEvent", async (req, res) => {
    //   try {
    //     const { rest, clickType } = req.query;
    //     const exists = await checkIfClientExists(rest);
    //     let spreadId;
    //     if (exists == -1) spreadId = await createClient(rest);
    //     else spreadId = exists;

    //     const client = await authorize();
    //     await appendEvent(client, spreadId, clickType);
    //     res.send("Event created");
    //   } catch (e) {
    //     console.log("error creating event", e);
    //     res.send("error");
    //   }
    // });

    // app.get("/api/finish", async (req, res, next) => {
    //   const client = await authorize();
    //   const clients = await fs.readFile(CLIENTS_PATH);
    //   let map = new Map(Object.entries(JSON.parse(clients)));
    //   let data = [];
    //   let list = [];
    //   let call = [];
    //   let wolt = [];
    //   let tenBis = [];
    //   let mishlocha = [];
    //   let google = [];
    //   let easy = [];
    //   let facebook = [];
    //   let instagram = [];
    //   let zapRest = [];
    //   let veganFriendly = [];
    //   let tripAdvisor = [];
    //   let ontapo = [];
    //   let waze = [];

    //   map.forEach(async (id, rest) => {
    //     data = await getSpreadSheetForRest(client, id);
    //     const month = new Date().getMonth();
    //     list = [];
    //     if (data) {
    //       call = [];
    //       wolt = [];
    //       tenBis = [];
    //       mishlocha = [];
    //       google = [];
    //       easy = [];
    //       facebook = [];
    //       instagram = [];
    //       zapRest = [];
    //       veganFriendly = [];
    //       tripAdvisor = [];
    //       ontapo = [];
    //       waze = [];
    //       let m;
    //       data.forEach((array) => {
    //         m = new Date(array[2]).getMonth();
    //         if (m == month - 1) {
    //           switch (array[0]) {
    //             case "call":
    //               call.push(array);
    //               break;

    //             case "wolt":
    //               wolt.push(array);
    //               break;

    //             case "tenBis":
    //               tenBis.push(array);
    //               break;

    //             case "mishlocha":
    //               mishlocha.push(array);
    //               break;

    //             case "google":
    //               google.push(array);
    //               break;

    //             case "easy":
    //               easy.push(array);
    //               break;

    //             case "facebook":
    //               facebook.push(array);
    //               break;
    //             case "instagram":
    //               instagram.push(array);
    //               break;

    //             case "zapRest":
    //               zapRest.push(array);
    //               break;
    //             case "veganFriendly":
    //               veganFriendly.push(array);
    //               break;

    //             case "tripAdvisor":
    //               tripAdvisor.push(array);
    //               break;
    //             case "ontapo":
    //               ontapo.push(array);
    //               break;
    //             case "waze":
    //               waze.push(array);
    //               break;
    //             default:
    //               break;
    //           }
    //         }
    //       });

    //       var objectToSend = {
    //         call: call.length,
    //         wolt: wolt.length,
    //         tenBis: tenBis.length,
    //         mishlocha: mishlocha.length,
    //         google: google.length,
    //         easy: easy.length,
    //         facebook: facebook.length,
    //         instagram: instagram.length,
    //         zapRest: zapRest.length,
    //         veganFriendly: veganFriendly.length,
    //         tripAdvisor: tripAdvisor.length,
    //         ontapo: ontapo.length,
    //         waze: waze.length,
    //       };
    //       console.log("rest", rest);
    //       console.log("list", objectToSend);
    //     }
    //   });

    //   res.send("thanx");
    // });

    app.get("/api/newRest", async (req, res) => {
      res.render(__dirname + '/restful.ejs');
    });

    app.get("/api/newMongoEvent", async (req, res) => {
      const { event, rest } = req.query;
      const result = await newMongoEvent(event, rest);
      res.send(result);
    });

    // app.get("/api/mongoFinish", async (req, res) => {
    //   const rest = req.query.rest;
    //   const oToSend = await finishMongo(rest);
    //   res.send(oToSend);
    // });

    app.post('/api/sendRest', async (req, res) => {
      const { title, titleHeb, email } = req.body
      if (title && titleHeb && email) {
        const result = await newMongoRest(req.body);
        res.render('links', { result });
        //res.send("פתח טאב חדש והעתק את הקישור הבא והוסף פרמטר איוונט מהרשימה" + "<br>" + "<p>" + " https://food-express.onrender.com/api/newMongoEvent?rest=" + result + "&event=בחר מהרשימה" + "</p><br><p> call | wolt | tenBis | mishlocha | google | easy | facebook | instagram | zapRest | veganFriendly | tripAdvisor | ontapo | waze</p><br><p>לאחר בניה של הקישור הנדרש יש להוסיף על כל כפתור בכרטיס ביקור של הלקוח בנפרד</p>")
      }
      else
        res.send("missing details")

    })

    app.get("/api/MongoWeek", async (req, res) => {
      allRests();
      res.send('thanks');
    });

    app.listen(process.env.PORT || 80, () => {
      console.log("Live...");
    });
  }
  catch (error) {
    console.log(error);
  }
})();