const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const { mongoDBURI } = require('../constants');

const store = new MongoDBStore({ uri: mongoDBURI, collection: 'sessions' });

const sessionConfig = {
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store,
};

module.exports = sessionConfig;
