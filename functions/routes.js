const express = require('express');
const passport = require('./passport');
const config = require('./config');
const { firebase, admin } = require('./firebase');

// Firebase strips out client side cookies, except `__session`
const SESSION_KEY = '__session';

const router = express.Router();

/**
 * Middleware that ensures a user is authenticated. We use a Firebase method to
 * decode a user from a session token and append this to the `req` object
 * for the next middleware.
 */
const ensureAuthenticated = async (req, res, next) => {
  try {
    const sessionCookie = req.cookies[SESSION_KEY] || '';
    console.log(sessionCookie);
    // Verify the session cookie. In this case an additional check is added to detect
    // if the user's Firebase session was revoked, user deleted/disabled, etc.
    const decodedClaims = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */);
    req.user = decodedClaims;
    return next();
  } catch (error) {
    // console.error(error);
    return res.status(401).send();
  }
};

/**
 * Simple API response.
 */
router.get('/api/message', (req, res) => {
  res.send({ message: 'Hello world!' });
});

/**
 * Deprecated: This requires a redirect from client->server->client which sets the session cookie, but future fetch requests cannot access the session.
 *
 * Facebook login entry point. The PassportJS strategy defined in `./passport.js`
 * will attempt to log the user in and redirect to the callback URL specified there
 * and referenced below.
 */
router.get(
  '/api/facebook',
  passport.authenticate('facebook', {
    failureFlash: true,
  })
);

/**
 * Deprecated: This requires a redirect from client->server->client which sets the session cookie, but future fetch requests cannot access the session.
 *
 * PassportJS Facebook callback. Create a session cookie and store this on the server.
 */
router.get('/api/facebook/callback', (req, res) =>
  passport.authenticate('facebook', async (error, user, info) => {
    try {
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
        res.cookie(SESSION_KEY, cookie, options);
        // res.redirect(config.get('facebook.loginSuccessURL'));
        res.send({ [SESSION_KEY]: cookie });
      }
    } catch (err) {
      res.send({ error: err });
    }
  })(req, res)
);

/**
 * Sign a Facebook user into Firebase auth and create a session cookie.
 */
router.post('/api/facebook', async (req, res) => {
  try {
    const credential = firebase.auth.FacebookAuthProvider.credential(
      req.body.accessToken
    );
    console.info('Firebase credential acquired');
    // Sign in with credential from the Facebook user.
    const result = await firebase
      .auth()
      .signInAndRetrieveDataWithCredential(credential);
    console.info('Firebase user authenticated');
    // Get the auth token
    const token = await result.user.getIdToken();
    console.info('Firebase auth token acquired');
    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    // Create the session cookie. This will also verify the ID token in the process.
    // The session cookie will have the same claims as the ID token.
    // To only allow session cookie setting on recent sign-in, auth_time in ID token
    // can be checked to ensure user was recently signed in before creating a session cookie.
    const cookie = await admin.auth().createSessionCookie(token, { expiresIn });
    console.info('Cookie generated');
    // Set cookie policy for session cookie.
    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };
    res.cookie(SESSION_KEY, cookie, options);
    res.status(204).send();
  } catch (error) {
    res.send({ error });
  }
});

/**
 * Get a user's profile (this is based on Firebase auth rather than
 * the direct Facebook profile, but still contains Facebook data)
 */
router.get('/api/profile', ensureAuthenticated, (req, res) => {
  res.send(req.user);
});

/**
 * Log a user out.
 */
router.get('/api/logout', (req, res) => {
  req.logout();
  res.clearCookie(SESSION_KEY);
  res.status(204).send();
});

/**
 * Return some debug data.
 */
router.get('/api/debug', (req, res) => {
  res.send({
    env: process.env.NODE_ENV,
    secure: process.env.NODE_ENV === 'production',
    cookies: req.cookies,
    headers: req.headers,
  });
});

/**
 * Set a test cookie.
 * Note: Firebase strips all non `__session` cookies from the client
 */
router.post('/api/cookie', (req, res) => {
  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  const options = {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };
  res.cookie(SESSION_KEY, 'test1234', options);
  res.send({ status: 'success' });
});

/**
 * Retrieve the test cookie.
 * Note: Firebase strips all non `__session` cookies from the client
 */
router.get('/api/cookie', (req, res) => {
  res.send({
    SESSION_KEY: req.cookies[SESSION_KEY],
  });
});

module.exports = router;
