const { GridFsStorage } = require("multer-gridfs-storage");
const { Grid } = require("gridfs-stream");
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { Post } = require("../models/post");
const { User } = require("../models/user");
const { Comment } = require("../models/comment");

// Connecting to MongoDB
const conn = mongoose.createConnection(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Initialize gfs
let gfs;

conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });
});

// Setting Storage Engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

// Rendering the post form
router.get("/create-post", async (req, res) => {
  res.render("index");
});

// Creating a post
router.post("/", upload.single("file"), async (req, res) => {
  let post = new Post({
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename,
  });

  const title = await Post.findOne({ title: req.body.title });
  if (title) return res.status(400).send("Post already exists!");

  post = await post.save();

  console.log(req.file);

  res.status(200).json({
    success: true,
    data: _.pick(post, [
      "_id",
      "title",
      "image",
      "description",
      "postedBy",
      "createdAt",
    ]),
  });
});

// Getting all posts
router.get("/", async (req, res) => {
  const posts = await Post.find();

  if (!posts) return res.status(404).send("No posts yet");

  res.status(200).json({ success: true, data: posts });
});

// Getting a post
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).send("Invalid Post ID");

  res.status(200).json({ success: true, data: post });
});

// Get post image
router.get("/:id/file/:filename", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send("Invalid Post ID");

  gfs.find({ filename: req.params.filename }).toArray((err, file) => {
    if (!file || file.length === 0) {
      return res.status(400).send("No file found!");
    }
    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  });
});

// Adding comments to a post
router.post("/:id/comments", async (req, res) => {
  let post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send("Invalid Post ID");

  const user = await User.findOne({ _id: req.body.userId });
  if (!user) return res.status(404).send("Invalid User ID");

  let comment = new Comment({
    text: req.body.text,
    user,
    post,
  });

  comment = await comment.save();

  post.comments.push(comment);
  post = await post.save();
  res.status(200).json({
    success: true,
    data: _.pick(comment, [
      "_id",
      "text",
      "user.name",
      "post.title",
      "createdAt",
    ]),
  });
});

// Getting comment
router.get("/:id/comments", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("comments");
  if (!post) return res.status(404).json("Invalid Post ID");

  res.status(200).json({ success: true, data: _.pick(post, ["comments"]) });
});

module.exports = router;
