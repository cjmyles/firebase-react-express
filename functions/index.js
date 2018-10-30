const functions = require('firebase-functions');
const express = require('express');
const session = require('cookie-session');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

const user = {
  username: '36nil',
  name: 'Craig Myles',
};

// PassportJS
passport.use(
  new LocalStrategy((username, password, done) => {
    return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  done(null, user);
});

// Create a new Express application
const app = express();

// Enable Body Parser (as JSON object)
app.use(require('body-parser').urlencoded({ extended: true }));

// Use cookie session
app.use(
  session({
    name: 'session',
    secret: '123456789',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// Log requests
app.use(morgan('dev'));

// Initialize Passport and restore authentication state, if any, from the session
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.get('/', (req, res) => {
  res.send('Functions entry point');
});

app.get('/api/basic', (req, res) => {
  res.send({ success: true });
});

app.post('/api/basic', (req, res) => {
  res.send({ success: true });
});

app.put('/api/basic', (req, res) => {
  res.send({ success: true });
});

app.delete('/api/basic', (req, res) => {
  res.send({ success: true });
});

app.get('/api/login', (req, res) => {
  const error = req.flash('error');
  res.send(error);
});

app.post(
  '/api/login',
  passport.authenticate('local', {
    failureRedirect: '/api/login',
    failureFlash: true,
  }),
  (req, res) => {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.send({ success: true });
  }
);

app.get('/api/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/api/profile', (req, res) => {
  res.send(req.user);
});

exports.api = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.api = functions.https.onRequest((request, response) => {
//   response.send("Hello from API!");
// });
