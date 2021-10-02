const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  url: {
      type: String
  }
});

const Video = mongoose.model("Video", videoSchema);

exports.videoSchema = videoSchema;
exports.Video = Video;
