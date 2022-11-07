const express = require('express');
const https = require('https');
const app = express();
const fs = require('fs');
const request = require('request');
app.use(express.static(__dirname + '/www/'));

function writeProductsJson() {
  let url = "https://fetch.onrender.com/products";
  https.get(url, (res) => {
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;      
    });

    res.on("end", () => {
      try {
        let json = JSON.stringify(body); 
        fs.writeFile('www/data.json', json, 'utf8', ()=>{ return;});
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
  writeProductsJson();
  //res.json(response);
});