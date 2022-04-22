const Joi = require('joi');
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    author: {
        type: String, 
        required: true,
        minlength: 3, 
        maxlength: 255
    },
    price: {
        type: Number,
        min: 500,
        max: 1000,
        required: true
    }, 
    image: {
        type: String
    },
    isPublished: {
        type: Boolean, 
        default: false
    },
}, { timestamps: true })

const Course = mongoose.model('Course', courseSchema);

// Slugify our category-name to get a slug value 
courseSchema.pre('validate', function(){
    if(this.title) {
      this.slug = slugify(this.title, { lower: true, strict: true })
    }
  })

const validateCourse = (course) => {
    const schema = Joi.object({
        title: Joi.string().min(5).max(50).required(),
        author: Joi.string().min(5).max(50).required(),
        price: Joi.number().min(500).max(1000).required(),
        image: Joi.string().required()
    })

    return schema.validate(course);
}

exports.validate = validateCourse;
exports.Course = Course;