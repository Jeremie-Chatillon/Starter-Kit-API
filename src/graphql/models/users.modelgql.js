const mongoose = require('mongoose');

/**
 * User Schema
 */
const options = {
  toObject: { virtuals: true }
};

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: mongoose.Schema.Types.String,
      required: true
    },
    lastname: {
      type: mongoose.Schema.Types.String,
      required: true
    },
    pseudo:{
      type: mongoose.Schema.Types.String,
      required: true
    },
    email: {
      type: mongoose.Schema.Types.String,
      required: true,
      match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      lowercase: true
    },
    password: {
      type: mongoose.Schema.Types.String,
      required: true
    },
  }, options
);

const UsersModel = mongoose.model('users', userSchema);

/**
 * @typedef Person
 */
module.exports = UsersModel;
