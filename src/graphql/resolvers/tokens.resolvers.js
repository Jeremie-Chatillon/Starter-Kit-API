const connectionTokenServices = require('../services/connectionToken.services');

const tokenResolvers = {
  Mutation: {
    login: (parent, args, context) => connectionTokenServices.login(args.email, args.password),

    relog: (parent, args, context) => connectionTokenServices.relog(args.token)

  },

  Token: {
    token: (parent, args, context) => parent
  },

};
module.exports = tokenResolvers;
