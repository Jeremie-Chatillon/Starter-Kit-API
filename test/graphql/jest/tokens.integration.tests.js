const jwt = require('jsonwebtoken');
const { graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const { resolvers, schema: typeDefs } = require('../../../src/graphql/graphqlConfig');
const clearDB = require('../clearDB');
const { populateDB, getTabUsers } = require('../../populateDatabase');

// Making schema graphql
const schema = makeExecutableSchema({ typeDefs, resolvers });

let tabUsers;

const clearAndPopulateDB = async() => {
  // ---------------------------------------- on supprime tout le contenu de la DB ----------------------------------------
  await clearDB();

  // ------------------------------------------- on ajoute le contenu de départ -------------------------------------------
  await populateDB();

  tabUsers = getTabUsers();
};

describe('Testing graphql resquest user', () => {
  describe('MUTATION tokens', () => {

    // ----------------------login(email: String!, password:String!)-------------------------------------- //
    describe('Testing login(email: String!, password:String!)', () => {
      beforeEach(async() => {
        await clearAndPopulateDB();
      });

      const { mutation } = {
        mutation: `mutation ($email: String!, $password: String!){
                      login(email: $email, password: $password){
                        token
                      }
                    }`
      };

      it('should return a new token because login succeed', async(done) => {
        const variables = { email: tabUsers[0].email, password: '1234abcd' };
        const result = await graphql(schema, mutation, null, {}, variables);
        const { token } = result.data.login;

        expect(token).not.toBeNull();
        done();
      });

      it('should fail during login because unknown email received', async(done) => {
        // on demande un nouveu token de validation d'email
        const variables = { email: 'unknown@mail.com', password: '1234abcd' };

        const result = await graphql(schema, mutation, null, {}, variables);
        expect.assertions(4);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].message).toEqual(`There is no user corresponding to the email "${variables.email}"`);
        expect(result.data).toBeNull();
        expect(result).toMatchSnapshot();
        done();
      });

      it('should fail during login because incorrect password received', async(done) => {
        // on demande un nouveu token de validation d'email
        const variables = { email: tabUsers[0].email, password: 'wrongPassword' };

        const result = await graphql(schema, mutation, null, {}, variables);
        expect.assertions(4);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].message).toEqual('Received password is not correct!');
        expect(result.data).toBeNull();
        expect(result).toMatchSnapshot();
        done();
      });
    });

    describe('Testing graphql resquest user', () => {
      describe('MUTATION tokens', () => {
    
        // ----------------------relog(token: String!)-------------------------------------- //
        describe('-relog(token: String!)', () => {
          beforeEach(async() => {
            await clearAndPopulateDB();
          });
    
          const { mutation } = {
            mutation: `mutation ($email: String!, $password: String!){
                          login(email: $email, password: $password){
                            token
                          }
                        }`
          };

          const { mutation2 } = {
            mutation: `mutation($tokenInput:String!){
              relog(token: $tokenInput){
                token
              }
            }`
          };
    
          let  tmpToken;
          it('should return the token because login succeed', async(done) => {
            const variables = { token:tmpToken };
            const result = await graphql(schema, mutation2, null, {}, variables);
            const { token } = result.data.login;
            
            expect(tmpToken).not.toBeNull();
            done();
          });
    
          
        });

    // ----------------------signUpAsUser(newUser: UserInputAdd!)-------------------------------------- //
    describe('Testing signUpAsUser(newUser: UserInputAdd!)', () => {
      beforeEach(async() => {
        await clearAndPopulateDB();
      });

      const { mutation } = {
        mutation: `mutation($user: UserInputAdd!){
                     signUp(newUser: $user){
                       token
                     }
                   }`
      };

      it('should create a new user and return a token', async(done) => {
        const variables = {
          user: {
            firstname: 'benoit',
            lastname: 'schop',
            email: 'ben@schop.ch',
            password: 'abcd1234'
          }
        };
        let result = await graphql(schema, mutation, null, {}, variables);
        const { token } = result.data.signUp;
        expect.assertions(3);
        expect(token).not.toBeNull();

        const context = { id: tabUsers[0].id, email: tabUsers[0].email };
        const { query } = {
          query: `query ($id: ID!){
                    user(userId: $id) {
                      firstname
                      lastname
                      email
                    }
                  }`
        };
        const tokenContent = await jwt.decode(token);
        const variableQuery = { id: tokenContent.id };
        result = await graphql(schema, query, null, context, variableQuery);
        expect(result.data.user).not.toBeNull();
        expect(result).toMatchSnapshot();
        done();
      });

      it('should fail creating a new user and returning a token because missing mendatory information (firstname)', async(done) => {
        const variables = {
          user: {
            lastname: 'schop',
            email: 'ben@schop.ch',
            password: 'abcd1234'
          }
        };
        const result = await graphql(schema, mutation, null, {}, variables);
        expect.assertions(3);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].message).toEqual(expect.stringContaining('Field value.firstname of required type String! was not provided.'));
        expect(result).toMatchSnapshot();
        done();
      });

      it('should fail creating a new user and returning a token because missing mendatory information (lastname)', async(done) => {
        const variables = {
          user: {
            firstname: 'benoit',
            email: 'ben@schop.ch',
            password: 'abcd1234'
          }
        };
        const result = await graphql(schema, mutation, null, {}, variables);
        expect.assertions(3);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].message).toEqual(expect.stringContaining('Field value.lastname of required type String! was not provided.'));
        expect(result).toMatchSnapshot();
        done();
      });

      it('should fail creating a new user and returning a token because missing mendatory information (email)', async(done) => {
        const variables = {
          user: {
            firstname: 'benoit',
            lastname: 'schop',
            password: 'abcd1234'
          }
        };
        const result = await graphql(schema, mutation, null, {}, variables);
        expect.assertions(3);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].message).toEqual(expect.stringContaining('Field value.email of required type String! was not provided.'));
        expect(result).toMatchSnapshot();
        done();
      });

      it('should fail creating a new user and returning a token because missing mendatory information (password)', async(done) => {
        const variables = {
          user: {
            firstname: 'benoit',
            lastname: 'schop',
            email: 'ben@schop.ch'
          }
        };
        const result = await graphql(schema, mutation, null, {}, variables);
        expect.assertions(3);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].message).toEqual(expect.stringContaining('Field value.password of required type String! was not provided.'));
        expect(result).toMatchSnapshot();
        done();
      });
    });
  });
});
