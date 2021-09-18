const asyncMiddleware = require("../middleware/async");
const config = require("config");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();

// Getting all users
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const users = await User.find();
    res.send(users);
  })
);

// Creating a user
router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already exists!");

    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save();

    const token = jwt.sign(
      { _id: user.id, email: user.email },
      config.get("jwtPrivateKey")
    );
    res.header("x-auth-token").send(_.pick(req.body, ["_id", "name", "email"]));
    // res.send(token)
  })
);

// Deleting a user
router.delete(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) return res.status(404).send("Invalid User ID");
    res.send(user);
  })
);

module.exports = router;
