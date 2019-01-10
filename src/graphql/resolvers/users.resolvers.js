const { isAuthenticatedAndIsYourself } = require('./authorization.resolvers');
const usersServices = require('../services/users.services');

const usersResolvers = {
  Query: {
    users: (parent, args, context) => usersServices.getUsers(),

    user: (parent, args, context) => usersServices.getUserById(args.userId),

    checkIfEmailIsAvailable: (parent, args, context) => usersServices.isEmailAvailable(args.email)
  },

  Mutation: {
    updateUser: async(parent, args, context) => {
      await isAuthenticatedAndIsYourself(context.id, args.user.id);
      return usersServices.updateUser(args.user);
    },

    newUser: async(parent, args, context) => {
      
      return usersServices.newUser(args.user);
    },

    deleteUser: async(parent, args, context) => {
      await isAuthenticatedAndIsYourself(context.id, args.userId);
      return usersServices.deleteUser(args.userId);
    }
  }
};
module.exports = usersResolvers;
