const jwt = require('jsonwebtoken');
const usersServices = require('./users.services');
const config = require('../../config/config');

async function login(email, password) {
  const user = await usersServices.getUserByLogin(email, password);

  return createConnectionToken(user.id, user.email);
}


async function relog(token) {
  await jwt.verify(token, config.jwtSecret);
  return token;
}




function createConnectionToken(id, email) {
  return jwt.sign({ id, email }, config.jwtSecret);
}

module.exports = {
  login,
  signUpAsUser,
  relog,
};
