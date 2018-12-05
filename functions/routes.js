const express = require('express');
const passport = require('./passport');
const config = require('./config');
const { admin } = require('./firebase');

const router = express.Router();

const ensureAuthenticated = async (req, res, next) => {
  try {
    const sessionCookie = req.cookies.session || '';
    // Verify the session cookie. In this case an additional check is added to detect
    // if the user's Firebase session was revoked, user deleted/disabled, etc.
    const decodedClaims = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */);
    req.user = decodedClaims;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).send();
  }
};

router.get('/api/message', (req, res) => {
  res.send({ message: 'Hello world!' });
});

router.get(
  '/api/facebook',
  passport.authenticate('facebook', {
    failureFlash: true,
  })
);

router.get('/api/facebook/callback', (req, res) =>
  passport.authenticate('facebook', async (error, user, info) => {
    if (error) {
      res.send({ error });
    } else {
      // Get the auth token
      const token = await user.getIdToken();
      console.info('Firebase auth token acquired');
      // Set session expiration to 5 days.
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      // Create the session cookie. This will also verify the ID token in the process.
      // The session cookie will have the same claims as the ID token.
      // To only allow session cookie setting on recent sign-in, auth_time in ID token
      // can be checked to ensure user was recently signed in before creating a session cookie.
      const cookie = await admin
        .auth()
        .createSessionCookie(token, { expiresIn });
      console.info('Cookie generated');
      // Set cookie policy for session cookie.
      const options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      };
      res.cookie('session', cookie, options);
      res.redirect(config.get('facebook.loginSuccessURL'));
    }
  })(req, res)
);

router.get('/api/profile', ensureAuthenticated, (req, res) => {
  res.send(req.user);
});

router.get('/api/logout', (req, res) => {
  req.logout();
  res.clearCookie('session');
  res.redirect(config.get('facebook.loginSuccessURL'));
});

router.get('/api/debug', (req, res) => {
  res.send({
    env: app.get('env'),
    secure: process.env.NODE_ENV === 'production',
    cookies: req.cookies,
  });
});

module.exports = router;
