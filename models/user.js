const Joi = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.Promise = global.Promise;

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
    minlength: 5,
    maxlength: 50,
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 255,
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

// Validating the schema input using Joi
const validateUser =(user) =>  {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(50).required(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

exports.validate = validateUser;
exports.User = User;
