const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const config = require('./config');
const { firebase, admin } = require('./firebase');

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(
  new FacebookStrategy(
    {
      clientID: config.get('facebook.appId'),
      clientSecret: config.get('facebook.appSecret'),
      callbackURL: config.get('facebook.callbackURL'),
      profileFields: ['id', 'first_name', 'last_name', 'emails'],
      // enableProof: false,
      // passReqToCallback: true,
      // display: 'popup',
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        console.info('Facebook accessToken acquired');
        // https://firebase.google.com/docs/auth/web/facebook-login?authuser=0#advanced-authenticate-with-firebase-in-nodejs
        // Build Firebase credential with the Facebook access token.
        const credential = firebase.auth.FacebookAuthProvider.credential(
          accessToken
        );
        console.info('Firebase credential acquired');
        // Sign in with credential from the Facebook user.
        const result = await firebase
          .auth()
          .signInAndRetrieveDataWithCredential(credential);
        console.info('Firebase user authenticated');
        return cb(null, result.user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

module.exports = passport;
