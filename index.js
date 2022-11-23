'use strict';
const express = require('express');
const https = require('https');
const fs = require('fs');
const request = require('request');
const app = express();
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
app.use(express.static(__dirname + '/www/'));
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:8000', 'https://food-express.onrender.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

(async () => {
  try {    
    const api = new WooCommerceRestApi({
      url: "https://restful.co.il",
      consumerKey: 'ck_4ccb70fa08146a01067376bb6e5ecaadc428138d',
      consumerSecret: 'cs_9f9fa79ac2d46cd96377f6604f9bfef79b9d7e11',
      version: "wc/v3"
    });
    api._stores = {

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
    api._products = {
      items : [],
      get_all: async () => {
        return await api.get("products", { per_page: 20 }).then((response) => {          
          console.log(api._products.items);
          for (var i = response.data.length - 1; i >= 0; i--) {
            let imgs = [];
            let item = {};
            item.id = response.data[i]["id"];
            item.name = response.data[i]["name"];
            item.job = response.data[i]["description"];
            item.price = response.data[i]["regular_price"];
            if (response.data[i]["images"].length > 0) {
              imgs.push(response.data[i]["images"][0]["src"])
            }
            item.images = imgs;
            api._products.items.push(item);
          }
          return api._products.items; // [{id:0,name: 'avi',price: 50, etc..}]
        }).catch((error) => {
          console.log(error);
        });
      },

      get: async (product_id) => {
        if(!api._products.length){
          api.get("products/" + product_id).then((response) => {
            console.log(response.data);
          }).catch((error) => {
            console.log(error);
          });
        }        
      },

      get_by_zone: async () => {
        return await api.get("products", { per_page: 20 }).then((response) => {
          let items = [];
          for (var i = response.data.length - 1; i >= 0; i--) {
            let imgs = [];
            let item = {};
            item.id = response.data[i]["id"];
            item.name = response.data[i]["name"];
            item.job = response.data[i]["description"];
            item.price = response.data[i]["regular_price"];
            if (response.data[i]["images"].length > 0) {
              imgs.push(response.data[i]["images"][0]["src"])
            }
            item.images = imgs;
            items.push(item);
          }
          return items; // [{id:0,name: 'avi',price: 50, etc..}]
        }).catch((error) => {
          console.log(error);
        });
      },
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

    app.listen(process.env.PORT || 8000, () => {
      console.log('listen to port 8000');
    });

    app.get("/", (req, res) => {
      res.sendFile(__dirname + '/www/index.html');
    });
    
    app.get("/api/products/", (req, res) => {      
      console.log(api._products.items);
      if(!api._products.items.length){
        api._products.get_all().then((response) => {
          res.json(response);
        });
      }
    });

    app.get("/api/products/write", (req, res) => {      
      writeProductsJson();
    });
  }
  catch (error) {
    console.log(error);
  }
})();