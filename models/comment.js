const mongoose = require("mongoose");
const slugify = require('slugify')

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  slug: {
    type: String, 
    required: true, 
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Replies",
    },
  ],
});

commentSchema.pre('validate', function(){
  if(this.text){
    this.slug = slugify(this.text, { lower: true, strict: true })
  }
})

const Comment = mongoose.model("Comment", commentSchema);

exports.commentSchema = commentSchema;
exports.Comment = Comment;
