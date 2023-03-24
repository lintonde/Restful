var express = require("express");
var router = express.Router();
var {
  authorize,
  appendEvent,
  checkIfClientExists,
  createClient,
  getSpreadSheetForRest,
} = require("./funcs");
const fs = require("fs").promises;
const path = require("path");
const CLIENTS_PATH = path.join(process.cwd(), "clients.json");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// ראווט ליצירת מסעדה חדשה במערכת  מקבל שם מסעדה ושומר בקובץ את האיידי של הספרדשיט
router.get("/createNewClient", async (req, res) => {
  /**
   * Create a google spreadsheet
   * @param {string} title Spreadsheets title
   * @return {string} Created spreadsheets ID
   */
  const restaurant = req.query.name;
  const exists = await checkIfClientExists(restaurant);
  if (exists != -1) res.send("Client already exists");
  else {
    await createClient(restaurant);
    res.send("Client's spreadsheeet created");
  }
});

// מקבל שם מסעדה אם לא קיימת מייצר אותה ושומר איוונט הכולל קליקטייפ וטיימטאמפ
router.get("/newEvent", async (req, res) => {
  try {
    const { rest, clickType } = req.query;
    const exists = await checkIfClientExists(rest);
    let spreadId;
    if (exists == -1) spreadId = await createClient(rest);
    else spreadId = exists;

    const client = await authorize();
    await appendEvent(client, spreadId, clickType);
    res.send("Event created");
  } catch (e) {
    console.log("error creating event", e);
    res.send("error");
  }
});

// ראוטר לסיכום חודשי עובר על כל קובץ הקליינטס ומוציא דוח לכל אחד בנפרד עפ סוגי קליקים.
router.get("/finish", async (req, res, next) => {
  const client = await authorize();
  const clients = await fs.readFile(CLIENTS_PATH);
  let map = new Map(Object.entries(JSON.parse(clients)));
  let data = [];
  let list = [];
  let call = [];
  let wolt = [];
  let tenBis = [];
  let mishlocha = [];
  let google = [];
  let easy = [];
  let facebook = [];
  let instagram = [];
  let zapRest = [];
  let veganFriendly = [];
  let tripAdvisor = [];
  let ontapo = [];
  let waze = [];

  map.forEach(async (id, rest) => {
    data = await getSpreadSheetForRest(client, id);
    const month = new Date().getMonth();
    list = [];
    if (data) {
      call = [];
      wolt = [];
      tenBis = [];
      mishlocha = [];
      google = [];
      easy = [];
      facebook = [];
      instagram = [];
      zapRest = [];
      veganFriendly = [];
      tripAdvisor = [];
      ontapo = [];
      waze = [];
      let m;
      data.forEach((array) => {
        m = new Date(array[2]).getMonth();
        if (m == month - 1) {
          switch (array[0]) {
            case "call":
              call.push(array);
              break;

            case "wolt":
              wolt.push(array);
              break;

            case "tenBis":
              tenBis.push(array);
              break;

            case "mishlocha":
              mishlocha.push(array);
              break;

            case "google":
              google.push(array);
              break;

            case "easy":
              easy.push(array);
              break;

            case "facebook":
              facebook.push(array);
              break;
            case "instagram":
              instagram.push(array);
              break;

            case "zapRest":
              zapRest.push(array);
              break;
            case "veganFriendly":
              veganFriendly.push(array);
              break;

            case "tripAdvisor":
              tripAdvisor.push(array);
              break;
            case "ontapo":
              ontapo.push(array);
              break;
            case "waze":
              waze.push(array);
              break;
            default:
              break;
          }
        }
      });

      var objectToSend = {
        call: call.length,
        wolt: wolt.length,
        tenBis: tenBis.length,
        mishlocha: mishlocha.length,
        google: google.length,
        easy: easy.length,
        facebook: facebook.length,
        instagram: instagram.length,
        zapRest: zapRest.length,
        veganFriendly: veganFriendly.length,
        tripAdvisor: tripAdvisor.length,
        ontapo: ontapo.length,
        waze: waze.length,
      };
      console.log("rest", rest);
      console.log("list", objectToSend);
    }
  });

  res.send("thanx");
});

module.exports = router;
