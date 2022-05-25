const slugify = require("slugify");
const Joi = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tutorialSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    slug: {
      type: String,
      unique: true,
    },
    video: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true }
);

// Slugify our course-title to get a slug value
tutorialSchema.pre("validate", function () {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

const validateTutorial = (tutorial) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    video: Joi.string().min(5).max(50).required(),
    price: Joi.number().min(500).max(1000).required(),
    video: Joi.string().required(),
  });

  return schema.validate(tutorial);
};

const Tutorial = mongoose.model("Tutorial", tutorialSchema);

exports.Tutorial = Tutorial;
exports.validate = validateTutorial;
