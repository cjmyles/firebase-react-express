const config = require('./config');
const admin = require('firebase-admin');
const firebase = require('firebase/app');
require('firebase/auth');

firebase.initializeApp(config.get('firebase.config'));
admin.initializeApp({
  credential: admin.credential.cert(config.get('firebase.serviceAccountKey')),
});

module.exports = { firebase, admin };
