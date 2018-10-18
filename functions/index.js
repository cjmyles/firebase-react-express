const functions = require("firebase-functions");
const express = require("express");

const app = express();

app.get("/api/timestamp", (req, res) => {
  res.send(`${Date.now()}`);
});

exports.api = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.api = functions.https.onRequest((request, response) => {
//   response.send("Hello from API!");
// });
