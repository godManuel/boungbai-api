const Joi = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Defining our User model
const userSchema = new Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 255,
    required: true
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

// Validating the user register request with Joi
const validateUser = (user) =>  {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(50).required(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

// Validating the user login request with Joi
const validateAuth = (auth) => {
  const schema = Joi.object({
      email: Joi.string().min(5).max(50).required(),
      password: Joi.string().min(5).max(255).required()
  })

  return schema.validate(auth);
}

exports.validateUser = validateUser;
exports.validateAuth = validateAuth;
exports.User = User;
