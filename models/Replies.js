const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
});

const Reply = mongoose.model("Reply", replySchema);

exports.replySchema = replySchema;
exports.Reply = Reply;
