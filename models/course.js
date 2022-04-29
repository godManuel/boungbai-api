const slugify = require("slugify");
const Joi = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    name: {
      type: String,
      enum: ["HTML", "CSS", "Bootstrap", "Javascript", "React", "Node"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    author: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
    price: {
      type: Number,
      min: 500,
      max: 1000,
      required: true,
    },
    image: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: [
        "Microsoft Office Suite",
        "Graphic Design",
        "Web Development & Hosting",
        "Penetration Testing",
      ],
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

// Slugify our category-name to get a slug value
courseSchema.pre("validate", function () {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

const validateCourse = (course) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    author: Joi.string().min(5).max(50).required(),
    price: Joi.number().min(500).max(1000),
    category: Joi.string().required(),
  });

  return schema.validate(course);
};

exports.validate = validateCourse;
exports.Course = Course;
