const usersServices = require('../../../src/graphql/services/users.services');
const clearDB = require('../clearDB');

let benoit;
let antoine;

let tabUsers;

const clearAndPopulateDB = async() => {
  // ---------------------------------------- on supprime tout le contenu de la DB ----------------------------------------
  await clearDB();

  // ------------------------------------------- on ajoute le contenu de départ -------------------------------------------

  benoit = {
    firstname: 'Benoît',
    lastname: 'Schöpfli',
    email: 'benoit@paysan.ch',
    password: '1234abcd',
  };

  antoine = {
    firstname: 'Antoine',
    lastname: 'Rochaille',
    email: 'antoine@paysan.ch',
    password: '1234abcd',
  };

  // on ajoute 2 utilisateurs
  benoit = (await usersServices.addUser(benoit)).toObject();
  antoine = (await usersServices.addUser(antoine)).toObject();

  tabUsers = [benoit, antoine];
};

describe('tests users services', () => {
  beforeEach(() => clearAndPopulateDB());

  describe('tests getUsers', () => {
    it('should get all users', async() => {
      // on récupère un tableau contenant tous les utilisateurs
      let allUsers = await usersServices.getUsers();

      // on transforme chaque utilisateur du tableau en un objet
      allUsers = allUsers.map(user => user.toObject());
      allUsers.should.be.an('array');
      allUsers.length.should.be.equal(2);
    });
  });

  describe('tests getUserById', () => {
    it('should get one user', async() => {
      // on récupère le utilisateur corresondant à l'id donné
      const user = (await usersServices.getUserById(benoit.id)).toObject();

      // on test son contenu
      user.should.be.not.null;
      user.id.should.be.eql(benoit.id);
      user.firstname.should.be.equal(benoit.firstname);
      user.lastname.should.be.equal(benoit.lastname);
      user.email.should.be.equal(benoit.email);
      user.password.should.be.equal(benoit.password);
    });

    it('should fail getting one user because no id received', async() => {
      try {
        await usersServices.getUserById('');
      } catch (err) {
        err.message.should.be.equal('Cast to ObjectId failed for value "" at path "_id" for model "users"');
      }
    });

    it('should fail getting one user because invalid id received (too short)', async() => {
      try {
        await usersServices.getUserById('abcdef');
      } catch (err) {
        err.message.should.be.equal('Cast to ObjectId failed for value "abcdef" at path "_id" for model "users"');
      }
    });

    it('should fail getting one user because invalid id received (too long)', async() => {
      try {
        await usersServices.getUserById('abcdefabcdefabcdefabcdefabcdefabcdef');
      } catch (err) {
        err.message.should.be.equal('Cast to ObjectId failed for value "abcdefabcdefabcdefabcdefabcdefabcdef" at path "_id" for model "users"');
      }
    });

    it('should fail getting one user because unknown id received', async() => {
      const userGotInDB = await usersServices.getUserById('abcdefabcdefabcdefabcdef');
      expect(userGotInDB).to.be.null;
    });
  });

  describe('tests addUser', () => {
    beforeEach(() => clearAndPopulateDB());

    it('should add a new user', async() => {
      benoit._id = undefined;
      benoit.email = 'benoit1@paysan.ch';
      benoit.password = '1234abcd';

      // on ajoute un nouveau utilisateur
      const addedUser = await usersServices.addUser(benoit);
      // on test son contenu
      addedUser.should.be.not.null;
      addedUser.id.should.be.not.null; // ne peut pas être égal à benoit.id !
      addedUser.firstname.should.be.equal(benoit.firstname);
      addedUser.lastname.should.be.equal(benoit.lastname);
      addedUser.email.should.be.equal(benoit.email);
      addedUser.password.should.be.not.null;
    });

    it('should fail adding a new user with an already used email', async() => {
      const userToAdd = {
        ...benoit,
        email: 'benoit2@paysan.ch',
        password: '1234abcd',
        _id: undefined
      };

      // on ajoute un nouveau utilisateur
      const addedUser = (await usersServices.addUser(userToAdd)).toObject();
      addedUser.should.be.not.null;
      addedUser.id.should.be.not.null;
      addedUser.firstname.should.be.equal(userToAdd.firstname);
      addedUser.lastname.should.be.equal(userToAdd.lastname);
      addedUser.email.should.be.equal(userToAdd.email);

      try {
        // on tente d'ajouter à nouveau le même utilisateur -> erreur car l'email est déjà utilisé
        await usersServices.addUser(userToAdd);
      } catch (err) {
        err.message.should.be.equal('This email is already used.');
      }
    });


    it('should fail adding a new user because invalid email received (1)', async() => {
      const userToAdd = {
        ...benoit,
        email: '@paysan.ch',
        password: '1234abcd'
      };

      // on ajoute un nouvel utilisateur
      try {
        const res = (await usersServices.addUser(userToAdd)).toObject();
      } catch (err) {
        err.should.be.not.null;
        err.message.should.be.equal(`users validation failed: email: Path \`email\` is invalid (${userToAdd.email}).`);
      }
    });

    it('should fail adding a new user because invalid email received (2)', async() => {
      const userToAdd = {
        ...benoit,
        email: 'benoit@.ch',
        password: '1234abcd'
      };

      // on ajoute un nouvel utilisateur
      try {
        const res = (await usersServices.addUser(userToAdd)).toObject();
      } catch (err) {
        err.should.be.not.null;
        err.message.should.be.equal(`users validation failed: email: Path \`email\` is invalid (${userToAdd.email}).`);
      }
    });

    it('should fail adding a new producer because invalid email received (3)', async() => {
      const userToAdd = {
        ...benoit,
        email: 'benoit@paysan',
        password: '1234abcd'
      };

      // on ajoute un nouveau producteur
      try {
        const res = (await usersServices.addUser(userToAdd)).toObject();
      } catch (err) {
        err.should.be.not.null;
        err.message.should.be.equal(`users validation failed: email: Path \`email\` is invalid (${userToAdd.email}).`);
      }
    });

    it('should fail adding a new producer because invalid email received (4)', async() => {
      const userToAdd = {
        ...benoit,
        email: 'benoit@paysan.ch.',
        password: '1234abcd'
      };

      // on ajoute un nouveau producteur
      try {
        const res = (await usersServices.addUser(userToAdd)).toObject();
      } catch (err) {
        err.should.be.not.null;
        err.message.should.be.equal(`users validation failed: email: Path \`email\` is invalid (${userToAdd.email}).`);
      }
    });
  });

  describe('tests updateUser', () => {
    beforeEach(() => clearAndPopulateDB());

    it('should update a user', async() => {
      // on récupère un utilisateur
      let user = await usersServices.getUserById(antoine.id);

      const { password } = user;

      // on le modifie
      user = {
        ...benoit,
        id: user.id,
        // on tente de modifier le password -> ne devrait pas se modifier lors de l'update
        password: '12341234'
      };
      // on met à jour dans la DB
      const updatedUser = await usersServices.updateUser(user);
      // on test son nouveau contenu
      updatedUser.should.be.not.null;
      updatedUser.id.should.be.equal(user.id);
      updatedUser.firstname.should.be.equal(user.firstname);
      updatedUser.lastname.should.be.equal(user.lastname);
      updatedUser.email.should.be.equal(antoine.email); // car l'email ne peut pas être modifié
      // on check que le password n'ait pas été modifié durant l'update!
      updatedUser.password.should.be.equal(password);
    });

    it('should fail updating a user because no id received', async() => {
      try {
        benoit.id = '';
        await usersServices.updateUser(benoit);
      } catch (err) {
        err.message.should.be.equal('Cast to ObjectId failed for value "" at path "_id" for model "users"');
      }
    });

    it('should fail updating a user because invalid id received (too short)', async() => {
      try {
        benoit.id = '5c04561e7209e21e582750'; // id trop court (<24 caractères)
        await usersServices.updateUser(benoit);
      } catch (err) {
        err.message.should.be.equal('Cast to ObjectId failed for value "5c04561e7209e21e582750" at path "_id" for model "users"');
      }
    });

    it('should fail updating a user because invalid id received (too long)', async() => {
      try {
        benoit.id = '5c04561e7209e21e582750a35c04561e7209e21e582750a35c04561e7209e21e582750a3'; // id trop long (> 24 caractères)
        await usersServices.updateUser(benoit);
      } catch (err) {
        err.message.should.be.equal('Cast to ObjectId failed for value "5c04561e7209e21e582750a35c04561e7209e21e582750a35c04561e7209e21e582750a3" at path "_id" for model "users"');
      }
    });

    it('should fail updating a user because unknown id received', async() => {
      try {
        benoit.id = 'abcdefabcdefabcdefabcdef';
        await usersServices.updateUser(benoit);
      } catch (err) {
        err.message.should.be.equal('The received id is not in the database!');
      }
    });
  });

  describe('tests deleteUser', () => {
    it('should delete a user', async() => {
      // on supprime un utilisateur
      let deleteUser = (await usersServices.deleteUser(benoit.id)).toObject();
      deleteUser.should.be.not.null;
      deleteUser.id.should.be.eql(benoit.id);

      // on tente de récupérer le même utilisateur -> retourne null car le utilisateur est introuvable dans la DB
      deleteUser = await usersServices.getUserById(deleteUser.id);

      expect(deleteUser).to.be.null;
    });

    it('should fail deleting a user because given id not found in DB', async() => {
      // on supprime un user inexistant -> retourne null car le user est introuvable dans la DB
      const deleteUser = await usersServices.deleteUser('abcdefabcdefabcdefabcdef');

      expect(deleteUser).to.be.null;
    });
  });
});
