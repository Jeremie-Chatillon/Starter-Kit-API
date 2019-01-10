const mongoose = require('mongoose');
const userServices = require('../services/users.services');

const options = {
  toObject: { virtuals: true }
};

/**
 * posts of user Schema
 */
const movieSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    text: {
      type: mongoose.Schema.Types.String,
      required: true
    },
    publicationDate: {
      type: mongoose.Schema.Types.Date,
      default: mongoose.Schema.Types.Date.now
    }
  }, options
);

/**
 * Vérifie l'existence du userId entré.
 * Lève une erreur s'il n'existe pas dans la base de données.
 */
postsSchema.pre('save', async function(next) {
  try {
    const userExist = await userServices.getUserById(this.userId);
    if (userExist == null) {
      throw new Error(`The given userId (${this.userId}) doesn’t exist in the database!`);
    }
    next();
  } catch (err) {
    next(err);
  }
});

const PostsModel = mongoose.model('posts', postsSchema);

/**
 * @typedef postsSchema
 */
module.exports = PostsModel;
