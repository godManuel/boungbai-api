const asyncMiddleware = require('../middleware/async');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();

// Logging a user in
router.post('/', asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send('Invalid email or password');

    const password = await bcrypt.compare(req.body.password, user.password);
    if (!password) return res.status(404).send('Invalid email or password');

    res.send(_.pick(user, ["email"]));
}))

// Validating the schema input with Joi
function validate(auth) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(5).max(255).required()
    })

    return schema.validate(auth);
}

module.exports = router;