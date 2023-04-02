const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGO_URI;
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const path = require("path");
const key = JSON.parse(process.env.CREDENTIALS);
const key2 = JSON.parse(process.env.KEY);
const fs = require("fs");
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const MailComposer = require("nodemailer/lib/mail-composer");
const ejs = require("ejs");

const newMongoRest = async (shop) => {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  const c = await client.connect();
  const result = await c
    .db("Restful")
    .collection("Shops")
    .insertOne({ name: shop.title, nameHeb: shop.titleHeb, email: shop.email });
  client.close();
};

// מייצר איוונט חדש למסעדה. מקבל שם מסעדה וסוג קליק

const newMongoEvent = async (event, rest) => {
  const now = new Date().getTime();
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  const c = await client.connect();
  const firstResult = await c
    .db("Restful")
    .collection("Shops")
    .findOne({ name: rest });
  if (!firstResult) {
    const newShop = await c
      .db("Restful")
      .collection("Shops")
      .insertOne({ name: rest });
  }
  const result = await c
    .db("Restful")
    .collection("Shops")
    .findOneAndUpdate(
      { name: rest },
      { $push: { event: { type: event, date: now } } }
    );

  client.close();
  return result;
};
// נותן תוצאות של חודש קודם
const finishMongo = async (rest) => {
  const now = new Date();
  const month = now.getMonth();
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  const c = await client.connect();
  let oToSent = {};

  const call = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "call" } },

      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (call.length > 0) {
    oToSent.call = call.length;
  } else oToSent.call = 0;
  const wolt = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "wolt" } },

      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (wolt.length > 0) oToSent.wolt = wolt[0].event.length;
  else oToSent.wolt = 0;
  const tenBis = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "tenBis" } },

      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (tenBis.length > 0) oToSent.tenBis = tenBis.length;
  else oToSent.tenBis = 0;

  const mishlocha = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "mishlocha" } },

      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (mishlocha.length > 0) oToSent.mishlocha = mishlocha.length;
  else oToSent.mishlocha = 0;
  const google = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "google" } },

      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (google.length > 0) oToSent.google = google.length;
  else oToSent.google = 0;
  const easy = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "easy" } },

      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  console.log(easy);
  if (easy.length > 0) oToSent.easy = easy.length;
  else oToSent.easy = 0;
  const facebook = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "facebook" } },
      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (facebook.length > 0) oToSent.facebook = facebook.length;
  else oToSent.facebook = 0;
  const instagram = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "instagram" } },
      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (instagram.length > 0) oToSent.instagram = instagram.length;
  else oToSent.instagram = 0;
  const zapRest = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "zapRest" } },
      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (zapRest.length > 0) oToSent.zapRest = zapRest.length;
  else oToSent.zapRest = 0;
  const veganFriendly = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "veganFriendly" } },
      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (veganFriendly.length > 0) oToSent.veganFriendly = veganFriendly.length;
  else oToSent.veganFriendly = 0;
  const tripAdvisor = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "tripAdvisor" } },
      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (tripAdvisor.length > 0) oToSent.tripAdvisor = tripAdvisor.length;
  else oToSent.tripAdvisor = 0;
  const ontapo = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "ontapo" } },
      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (tripAdvisor.length > 0) oToSent.ontapo = ontapo.length;
  else oToSent.ontapo = 0;
  const waze = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "waze" } },
      { $match: { $expr: { $eq: [{ $month: "$_id" }, month] } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (waze.length > 0) oToSent.waze = waze.length;
  else oToSent.waze = 0;

  client.close();
  return oToSent;
};
// נותן תוצאות שבוע קודם - מייצר אובייקט לשליחה
const weekMongo = async (rest) => {
  console.log("rest ", rest);
  const now = new Date().getTime();
  const nowStart = now - 7 * 24 * 60 * 60 * 1000;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  const c = await client.connect();
  let oToSent = {};
  const restaurantful = await c
    .db("Restful")
    .collection("Shops")
    .findOne({ name: rest });
  oToSent.name = restaurantful.name;
  oToSent.email = restaurantful.email;
  oToSent.nameHeb = restaurantful.nameHeb;
  const call = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "call" } },

      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (call.length > 0) {
    oToSent.call = call.length;
  } else oToSent.call = 0;
  const wolt = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "wolt" } },

      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (wolt.length > 0) oToSent.wolt = wolt.length;
  else oToSent.wolt = 0;
  const tenBis = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "tenBis" } },

      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (tenBis.length > 0) oToSent.tenBis = tenBis.length;
  else oToSent.tenBis = 0;

  const mishlocha = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "mishlocha" } },

      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (mishlocha.length > 0) oToSent.mishlocha = mishlocha.length;
  else oToSent.mishlocha = 0;
  const google = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "google" } },

      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (google.length > 0) oToSent.google = google.length;
  else oToSent.google = 0;
  const easy = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "easy" } },

      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  console.log(easy);
  if (easy.length > 0) oToSent.easy = easy.length;
  else oToSent.easy = 0;
  const facebook = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "facebook" } },
      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (facebook.length > 0) oToSent.facebook = facebook.length;
  else oToSent.facebook = 0;
  const instagram = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "instagram" } },
      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (instagram.length > 0) oToSent.instagram = instagram.length;
  else oToSent.instagram = 0;
  const zapRest = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "zapRest" } },
      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (zapRest.length > 0) oToSent.zapRest = zapRest.length;
  else oToSent.zapRest = 0;
  const veganFriendly = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "veganFriendly" } },
      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (veganFriendly.length > 0) oToSent.veganFriendly = veganFriendly.length;
  else oToSent.veganFriendly = 0;
  const tripAdvisor = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "tripAdvisor" } },
      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (tripAdvisor.length > 0) oToSent.tripAdvisor = tripAdvisor.length;
  else oToSent.tripAdvisor = 0;
  const ontapo = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "ontapo" } },
      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (tripAdvisor.length > 0) oToSent.ontapo = ontapo.length;
  else oToSent.ontapo = 0;
  const waze = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([
      { $match: { name: rest } },
      { $unwind: "$event" },
      { $match: { "event.type": "waze" } },
      { $match: { "event.date": { $gt: nowStart, $lt: now } } },
      { $project: { event: 1, _id: 0 } },
    ])
    .toArray();
  if (waze.length > 0) oToSent.waze = waze.length;
  else oToSent.waze = 0;

  client.close();
  return oToSent;
};

// שולח מייל שבועי
const sendWeekMail = async (o, title, email) => {
  const credentials = key2;

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
  /*
const url = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: GMAIL_SCOPES,
});
console.log(url)
*/
  const code =
    "4/0AVHEtk5LBTWSbk51fQIXcKNTCZC1W5Z1QVwNKpTy2qz3Y8dgGCTy6VVsFksNLq9HeMc-nQ";

  /*
oAuth2Client.getToken(code).then(({ tokens }) => {
  const tokenPath = path.join(__dirname, 'token.json');
  fs.writeFileSync(tokenPath, JSON.stringify(tokens));
  console.log('Access token and refresh token stored to token.json');
});
*/

  const encodeMessage = (message) => {
    return Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const createMail = async (options) => {
    const mailComposer = new MailComposer(options);
    const message = await mailComposer.compile().build();
    return encodeMessage(message);
  };

  const sendMail = async (options) => {
    oAuth2Client.setCredentials(JSON.parse(process.env.TOKEN));
    const gmail = await google.gmail({ version: "v1", auth: oAuth2Client });
    const rawMessage = await createMail(options);
    const { data: { id } = {} } = await gmail.users.messages.send({
      userId: "me",
      resource: {
        raw: rawMessage,
      },
    });
    return id;
  };
  const pathtoEjs = path.join(__dirname, "./weekEmail.ejs");
  const subject = "סיכום שבועי של קליקים בכרטיס ביקור של רסטפול";
  const data = await ejs.renderFile(pathtoEjs, { o });
  console.log(data);
  const options = {
    to: o.email,

    subject,
    text: JSON.stringify(o),
    html: data,
  };

  const messageId = await sendMail(options);
  console.log(messageId);
};

//עובר על כל המסעדות מוציא את השם ושולח אחד אחד לוויקמונגו

const allRests = async () => {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  const c = await client.connect();
  const names = await c
    .db("Restful")
    .collection("Shops")
    .aggregate([{ $project: { name: 1, _id: 0 } }])
    .toArray();
  for (const name of names) {
    const o = await weekMongo(name.name);
    await sendWeekMail(o);
  }
};
module.exports = {
  finishMongo,
  newMongoEvent,
  newMongoRest,
  weekMongo,
  sendWeekMail,
  allRests
};