const asyncMiddleware = require("../middleware/async");
const { User } = require("../models/user");
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
