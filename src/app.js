const express = require('express');
const mongoose = require('mongoose');
const { ApolloServer, AuthenticationError } = require('apollo-server-express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { resolvers, schema: typeDefs } = require('./graphql/graphqlConfig');

const config = require('./config/config');

mongoose.connect(config.db, { useNewUrlParser: true })
  .then(() => console.log(`connecté à la base de donnée de ${process.env.NODE_ENV} --> ${config.db}`))
  .catch(error => console.log(`la connexion à la database ${config.db} a échoué\n${error.message}`));

const app = express();

/*
Au cas ou il y a une HeaderFault
const corsOptions = {
  origin(origin, callback) {
    callback(null, true);
  },
  credentials: true
};
app.use(cors(corsOptions));
var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}
app.use(allowCrossDomain);
*/
// Active CORS pour le client
app.use(cors());

const getToken = async (req) => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      return await jwt.verify(token, config.jwtSecret);
    } catch (e) {
      throw new AuthenticationError('Your session expired. Sign in again.');
    }
  }
};

// Integrate apollo as a middleware
const server = new ApolloServer(
  {
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
    context: ({ req }) => getToken(req)
  }
);
server.applyMiddleware({ app });

module.exports = require('./config/express')(app, config);
