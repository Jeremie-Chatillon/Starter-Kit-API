const jwt = require('jsonwebtoken');
const usersServices = require('./users.services');
const config = require('../../config/config');

async function login(email, password) {
  const user = await usersServices.getUserByLogin(email, password);

  return createConnectionToken(user.id, user.email);
}


function relog(token) {

  return  jwt.verify(token, config.jwtSecret);
}



async function signUpAsUser(newUser) {
  // le check de la disponibilité de l'email et de la force du mdp sont fait dans addUser()
  const user = await usersServices.addUser(newUser);

  // on crée et retourne un token de connection
  return createConnectionToken(user.id, user.email);
}

function createConnectionToken(id, email) {
  return jwt.sign({ id, email }, config.jwtSecret);
}

module.exports = {
  login,
  signUpAsUser,
  relog
};
