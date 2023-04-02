const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const CLIENTS_PATH = path.join(process.cwd(), "clients.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
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
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listMajors(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    range: "Class Data!A2:E",
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log("No data found.");
    return;
  }
  console.log("Name, Major:");
  rows.forEach((row) => {
    // Print columns A and E, which correspond to indices 0 and 4.
    console.log(`${row[0]}, ${row[4]}`);
  });
}

/**
 * Create a google spreadsheet
 * @param {string} title Spreadsheets title
 * @return {string} Created spreadsheets ID
 */
async function create(auth, name) {
  const title = name;

  const service = google.sheets({ version: "v4", auth });
  const resource = {
    properties: {
      title,
    },
  };
  try {
    const spreadsheet = await service.spreadsheets.create({
      resource,
      fields: "spreadsheetId",
    });
    console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
    return spreadsheet.data.spreadsheetId;
  } catch (err) {
    // TODO (developer) - Handle exception
    throw err;
  }
}

async function appendEvent(auth, spreadsheetId, clickType) {
  const service = google.sheets({ version: "v4", auth });
  let range = "A1";
  valueInputOption = "RAW";
  console.log(spreadsheetId);
  const now = new Date();
  const millis = now.getTime();
  const ISO = now.toISOString();
  const values = [[clickType, ISO, millis]];
  const resource = {
    values,
  };
  try {
    const result = await service.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      resource,
    });
    console.log(`${result.data.updates.updatedCells} cells appended.`);

    return result;
  } catch (err) {
    // TODO (developer) - Handle exception
    throw err;
  }
}

const checkIfClientExists = async (restaurant) => {
  try {
    const clients = await fs.readFile(CLIENTS_PATH);
    let map = new Map(Object.entries(JSON.parse(clients)));
    if (map.has(restaurant)) {
      // Checks if client exists
      return map.get(restaurant);
    } else {
      return -1;

      res.send("Restaurant spreadsheet created");
    }
  } catch (e) {
    console.log("error new client", e);
  }
};

const createClient = async (restaurant) => {
  try {
    const client = await authorize();
    const spreadSheetId = await create(client, restaurant);
    const clients = await fs.readFile(CLIENTS_PATH);
    let map = new Map(Object.entries(JSON.parse(clients)));
    map.set(restaurant, spreadSheetId);
    const json = JSON.stringify(Object.fromEntries(map));

    await fs.writeFile(CLIENTS_PATH, json);
    return spreadSheetId;
  } catch (e) {
    console.log("error creating file", e);
    return false;
  }
};

const getSpreadSheetForRest = async (auth, spreadsheetId) => {
  const range = "Sheet1";

  const service = google.sheets({ version: "v4", auth });

  const result = await service.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return result.data.values;
};
module.exports = {
  authorize,
  create,
  appendEvent,
  checkIfClientExists,
  createClient,
  getSpreadSheetForRest,
};
