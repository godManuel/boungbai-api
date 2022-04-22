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

const Post = mongoose.model("Post", postSchema);

function validatePost(post) {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required()
  });

  return schema.validate(post);
}

exports.Post = Post;
exports.postSchema = postSchema;
exports.validate = validatePost;
