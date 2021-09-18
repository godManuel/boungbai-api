const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');
const { Course, validate } = require('../models/course');
const express = require('express');
const router = express.Router();

// Getting all courses
router.get('/', auth, asyncMiddleware(async (req, res) => {
    const courses = await Course.find().sort({ date: -1 });
    res.send(courses);
}))

// Getting a course
router.get('/:id', asyncMiddleware(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).send('Invalid Course ID');
    res.send(course);
}))

// Creating a course
router.post('/', asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let course = new Course({
        name: req.body.name,
        author: req.body.author,
        price: req.body.price,
        isPublished: req.body.isPublished
    })

    course = await course.save();
    res.send(course);
}))

// Updating a course
router.put('/:id', asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const course = await Course.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        author: req.body.author,
        price: req.body.price,
        isPublished: req.body.isPublished
    }, { new: true });

    if (!course) return res.status(404).send('Invalid Course ID');

    res.send(course);
}))

// Deleting a course
router.delete('/:id', auth, asyncMiddleware(async (req, res) => {
    const course = await Course.findByIdAndRemove(req.params.id);
    if (!course) return res.status(404).send('Invalid Course ID');
    res.send(course);
}))


module.exports = router;