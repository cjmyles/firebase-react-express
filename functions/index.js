const functions = require('firebase-functions');
const express = require('express');
const morgan = require('morgan');
const flash = require('connect-flash');
const passport = require('./passport');

console.log('NODE_ENV:', process.env.NODE_ENV);

// // Create a new Express application
const app = express();

// Enable Cookie Parser
app.use(require('cookie-parser')());
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
// Enable Body Parser (as JSON object)
app.use(require('body-parser').urlencoded({ extended: true }));

// Log requests
app.use(morgan('dev'));

// Initialize Passport and restore authentication state, if any, from the session
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Configure our routes
app.use(require('./routes'));

// Map our express app to Firebase Functions
exports.app = functions.https.onRequest(app);
