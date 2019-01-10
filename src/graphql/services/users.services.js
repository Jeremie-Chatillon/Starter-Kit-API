const bcrypt = require('bcrypt');
const UsersModel = require('../models/users.modelgql');

function getUsers() {
  return UsersModel.find()
    .sort({ _id: 1 });
}

function getUserById(id) {
  return UsersModel.findById(id);
}


async function getUserByLogin(email, password) {
  const user = await UsersModel.findOne({ email });

  if (user == null || user.id == null) {
    throw new Error(`There is no user corresponding to the email "${email}"`);
  }

  // une personne avec cet email a été trouvée dans la DB -> on compare le password reçu en paramètre avec le mdp enregistré dans la DB
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error('Received password is not correct!');
  }
  // si le mdp est correct, on retourne la personne{}
  return user;
}

async function isEmailAvailable(emailUser) {
  const existingPerson = await UsersModel.findOne({ email: emailUser });
  return existingPerson === null;
}

async function isPseudoAvailable(pseudoUser) {
  const existingPerson = await UsersModel.findOne({ pseudo: pseudoUser });
  return existingPerson === null;
}

function checkIfPasswordIsValid(password) {
  if (password.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }
  if (password.length > 30) {
    throw new Error('New password must be less than 30 characters long.');
  }
  if (password.search(/\d/) === -1) {
    throw new Error('New password must contain at least 1 number.');
  }
  if (password.search(/[a-zA-Z]/) === -1) {
    throw new Error('New password must contain at least 1 letter.');
  }
  // si on arrive jusqu'ici -> le mdp est valide
  return true;
}

async function newUser({ firstname, lastname, email, pseudo, password }) {
  if (await isEmailAvailable(email) && checkIfPasswordIsValid(password)  && isPseudoAvailable(password)) {
    const userToAdd = {
      firstname,
      lastname,
      email,
      pseudo,
      password: await bcrypt.hash(password, 10)
    };

    return new UsersModel(userToAdd).save();
  } else {
    throw new Error('This email is already used.');
  }
}

async function updateUser({ id, firstname, lastname }) {
  const userToUpdate = {
    id
  };

  if (firstname != null) {
    userToUpdate.firstname = firstname;
  }
  if (lastname != null) {
    userToUpdate.lastname = lastname;
  }

  return UsersModel.findByIdAndUpdate(id, userToUpdate, { new: true }); // retourne l'objet modifié
}

function deleteUser(id) {
  return UsersModel.findByIdAndRemove(id);
}

module.exports = {
  getUsers,
  getUserById,
  getUserByLogin,
  isEmailAvailable,
  addUser,
  updateUser,
  deleteUser
};
