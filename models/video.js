const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  course: {
    type: String,
    required: true
  },
  url: {
      type: String
  }
});

const Video = mongoose.model("Video", videoSchema);

exports.videoSchema = videoSchema;
exports.Video = Video;
