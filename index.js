const express = require("express");
const app = express();
const request = require('request');
app.use(express.static(__dirname + '/www/'));

app.listen(process.env.PORT || 80, () => {
  console.log('listen to port 80');
});

app.get("/products", (req, res) => {
  res.sendFile(__dirname + '/www/index.html');
});