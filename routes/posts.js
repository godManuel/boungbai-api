const cloudinary = require("../utils/cloudinary");
const cloudinaryConfig = cloudinary.cloudinaryConfig;
const multer = require("../utils/multer");
const multerUploads = multer.multerUploads;
const datauri = multer.datauri;
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { Post } = require("../models/post");
const { User } = require("../models/user");
const { Comment } = require("../models/comment");
const { Reply } = require("../models/reply");

// Rendering the post form
router.get("/create-post", async (req, res) => {
  res.render("index");
});

// Creating a post
router.post(
  "/",
  multerUploads.single("file"),
  cloudinaryConfig,
  async (req, res) => {
    const file = datauri(req);

    cloudinary.uploader.upload(file.content, async (err, result) => {
      if (err) throw err;

      let post = new Post({
        title: req.body.title,
        description: req.body.description,
        image: result.secure_url,
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
  }
);

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

  post.comments.unshift(comment);
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

// Adding replies to a comment
router.post("/:id/reply", async (req, res) => {
  let comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).send("Invalid Post ID");

  const user = await User.findOne({ _id: req.body.userId });
  if (!user) return res.status(404).send("Invalid User ID");

  let reply = new Reply({
    text: req.body.text,
    user,
    comment,
  });

  reply = await reply.save();

  comment.replies.unshift(reply);
  comment = await comment.save();

  res.status(200).json({
    success: true,
    data: _.pick(reply, [
      "_id",
      "text",
      "user.name",
      "comment.text",
      "createdAt",
    ]),
  });
});

// Getting replies
router.get("/:id/replies", async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate("replies");
  if (!comment) return res.status(404).json("Invalid Post ID");

  res.status(200).json({ success: true, data: _.pick(comment, ["replies"]) });
});

module.exports = router;
