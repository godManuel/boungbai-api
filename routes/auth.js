const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { User, validateAuth, validateUser } = require('../models/User');
const asyncMiddleware = require('../middleware/async');
const express = require('express');
const router = express.Router();

// @DESC    Login user
// @ROUTE   /api/auth/login-user
// @ACCESS  Public
router.post('/login-user', asyncMiddleware(async (req, res) => {
    const { error } = validateAuth(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json('Invalid credentials');

    const password = await bcrypt.compare(req.body.password, user.password);
    if (!password) return res.status(404).json('Invalid credentials');

    const token = jwt.sign(
        { _id: user.id, email: user.email },
        process.env.JWT_KEY
      );

    res.status(200).json({
      user: {
        id: user.id, 
        email: user.email,
        token
      }  
    });
}))

// @DESC    Register user
// @ROUTE   /api/auth/create-user
// @ACCESS  Public
router.post(
    "/create-user",
    asyncMiddleware(async (req, res) => {
      const { error } = validateUser(req.body);
      if (error) return res.status(400).json(error.details[0].message);
  
      let user = await User.findOne({ email: req.body.email });
      if (user) return res.status(400).json('User already exist');
  
      user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
  
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save(); 
  
      const token = jwt.sign(
        { _id: user.id, email: user.email },
        process.env.JWT_KEY
      );

      res.status(201).json({
        user: {
            id: user.id,
            email: user.email, 
            token
        }
      });
    })
  );




module.exports = router;