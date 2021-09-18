const Joi = require('joi');
const mongoose = require('mongoose');

const Course = mongoose.model('Course', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    author: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    date: {
        type: Date,
        default: Date.now()
    },
    price: {
        type: Number,
        required: true,
        min: 5,
        max: 300
    },
    isPublished: {
        type: Boolean,
        required: true,
        default: false
    }
}));


function validateCourse(course) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        author: Joi.string().min(5).max(50).required(),
        price: Joi.number().min(5).max(300).required(),
        isPublished: Joi.boolean().required()
    })

    return schema.validate(course);
}

exports.validate = validateCourse;
exports.Course = Course;