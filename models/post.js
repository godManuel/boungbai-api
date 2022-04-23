const slugify = require('slugify')
const mongoose = require("mongoose");
const Joi = require("joi");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      min: 5,
      max: 20,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      min: 5,
      max: 255,
    },
    slug: {
    type: String, 
    required: true, 
    unique: true
  },
    image: {
      type: String,
    },
    postedBy: {
      type: String,
      default: "Admin",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

postSchema.pre('validate', function(){
    if(this.title) {
      this.slug = slugify(this.title, { lower: true, strict: true })
    }
  })

const Post = mongoose.model("Post", postSchema);

const validatePost = (post) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required()
  });

  return schema.validate(post);
}

exports.validate = validatePost;
exports.Post = Post;
