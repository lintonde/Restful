'use strict';

// imports
import { get as _get } from 'https';
import { writeFile } from 'fs';
import { express } from 'express';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { json as _json, urlencoded } from 'body-parser';
import { get as __get } from 'request';
import cors from 'cors';
import { authorize } from 'passport';
const app = express();
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// app
app.use(app.static(__dirname + '/www/'));
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
app.use(_json()); // support json encoded bodies
app.use(urlencoded({ extended: true })); // support encoded bodies
app.use(cors());

// Restful API
(async () => {
  try {
    const google_api = {
      auth: function() {
        const fs = require('fs');
        const path = require('path');
        const process = require('process');
        const { authenticate } = require('@google-cloud/local-auth');
        const { google } = require('googleapis');

        // If modifying these scopes, delete token.json.
        const SCOPES = [
          'https://www.googleapis.com/auth/spreadsheets'
        ];
        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        const TOKEN_PATH = path.join(process.cwd(), 'token.json');
        const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

        /**
         * Reads previously authorized credentials from the save file.
         *
         * @return {Promise<OAuth2Client|null>}
         */
         function loadSavedCredentialsIfExist() {
          try {
            const content =  fs.readFile(TOKEN_PATH);
            const credentials = JSON.parse(content);
            return google.auth.fromJSON(credentials);
          } catch (err) {
            return null;
          }
        }

        /**
         * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
         *
         * @param {OAuth2Client} client
         * @return {Promise<void>}
         */
         function saveCredentials(client) {
          const content =  fs.readFile(CREDENTIALS_PATH);
          const keys = JSON.parse(content);
          const key = keys.installed || keys.web;
          const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
          });
           fs.writeFile(TOKEN_PATH, payload);
        }

        /**
         * Load or request or authorization to call APIs.
         *
         */
         function authorize() {
          let client =  loadSavedCredentialsIfExist();
          console.log(client);
          return client;
          if (client) {
            return client;
          }
          client =  authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
          });
          if (client.credentials) {
             saveCredentials(client);
          }
          console.log(client);
          return client;
        }

        return  authorize();
      },
      addTracking:  () => {
       const auth = authorize();
        if (auth) {
          const title = "test1"
          const service = google.sheets({ version: 'v4', auth });
          const resource = {
            properties: {
              title,
            },
          };
          try {
            console.log(service);
            const spreadsheet = servic.create({
              resource,
              fields: 'spreadsheetId',
            });
            console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
            return spreadsheet.data.spreadsheetId;
          } catch (err) {
            // TODO (developer) - Handle exception
            throw err;
          }
        }
      }
    };

    // objects to use
    const woo_api = new WooCommerceRestApi({
      url: "https://restful.co.il",
      consumerKey: 'ck_4ccb70fa08146a01067376bb6e5ecaadc428138d',
      consumerSecret: 'cs_9f9fa79ac2d46cd96377f6604f9bfef79b9d7e11',
      version: "wc/v3"
    });
    woo_api._stores = {

      get_all_stores: async function () {
        let url = 'https://restful.co.il/wp-json/wcfmmp/v1/store-vendors'; // all
        __get({
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
        __get({
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
        __get({
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
        __get({
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
      _get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            let json = JSON.stringify(body);
            writeFile('www/data.json', json, 'utf8', () => { return; });
          } catch (error) {
            console.error(error.message);
          };
        });

      }).on("error", (error) => {
        console.error(error.message);
      });
    }
    app.listen(process.env.PORT || 80, () => {
      console.log('listen to port 80');
    });

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

    app.get("/api/track/", async (req, res) => {
      const clientName = req.query['clientName'];
      const clickType = req.query['clickType'];
      let output = 'clientName is ' + clientName + ', and clickType is ' + clickType;
      let client;
      google_api.auth().then(function(result) {
        console.log(result);
        client = result;
     })
      const isTracked = google_api.addTracking(client);
      console.log(client.SCOPES);
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

    app.get("/api/products/write", (req, res) => {
      writeProductsJson();
    });
  }
  catch (error) {
    console.log(error);
  }
})();