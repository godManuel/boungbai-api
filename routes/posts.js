const cloudinary = require("../utils/cloudinary");
const cloudinaryConfig = cloudinary.cloudinaryConfig;
const multer = require("../utils/multer");
const multerUploads = multer.multerUploads;
const datauri = multer.datauri;
const express = require("express");
const router = express.Router();
const { Post } = require('../models/post')
const { User } = require("../models/user");
const { Comment } = require("../models/comment");
const { Replies } = require("../models/Replies");
const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth')

// router.get("/create-post", async (req, res) => {
//   res.render("index");
// });

// @DESC    Create post
// @ROUTE   /api/posts
// @ACCESS  Private
router.post("/", multerUploads.single("file"), cloudinaryConfig, auth, asyncMiddleware(async (req, res) => {
    const file = datauri(req);

    cloudinary.uploader.upload(file.content, async (err, result) => {
      if (err) throw err;

      let post = new Post({
        title: req.body.title,
        description: req.body.description,
        image: result.secure_url,
      });

      const title = await Post.findOne({ title: req.body.title });
      if (title) return res.status(400).json("Post already exists!");

      await post.save();

      res.status(200).json({ post });
    });
  }
));

// @DESC    Get posts
// @ROUTE   /api/posts
// @ACCESS  Public
router.get("/", async (req, res) => {
  const posts = await Post.find();

  if (!posts) return res.status(404).json("No posts yet");

  res.status(200).json({ posts });
});

// @DESC    Get post
// @ROUTE   /api/posts/post-title
// @ACCESS  Public
router.get("/:slug", async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug });

  if (!post) return res.status(404).json("Invalid Post ID");

  res.status(200).json({ post });
});

// @DESC    Add comments to post
// @ROUTE   /api/posts/post-title/comments
// @ACCESS  Public
router.post("/:slug/comments", async (req, res) => {
  let post = await Post.findOne({ slug: req.params.slug });
  if (!post) return res.status(404).json("Invalid Post ID");

  const user = await User.findOne({ _id: req.body.userId });
  if (!user) return res.status(404).json("Invalid User ID");

  let comment = new Comment({
    text: req.body.text,
    user,
    post,
  });

  await comment.save();

  post.comments.unshift(comment);
  await post.save();

  res.status(200).json({
    comment: {
      id: comment.id, 
      text: comment.text,
      username: comment.user.name,
      postTitle: comment.post.title,
      date: comment.createdAt 
    }
  });
});

// Getting comment
router.get("/:slug/comments", async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate("comments");
  if (!post) return res.status(404).json("Invalid Post ID");

  res.status(200).json({ postComment: post.comments });
});

// Adding replies to a comment
router.post("/:slug/reply", async (req, res) => {
  let comment = await Comment.findOne({ slug: req.params.slug });
  if (!comment) return res.status(404).json("Invalid Post ID");

  const user = await User.findOne({ _id: req.body.userId });
  if (!user) return res.status(404).json("Invalid User ID");

  let reply = new Replies({
    text: req.body.text,
    user,
    comment,
  });

  await reply.save();

  comment.replies.unshift(reply);
  await comment.save();

  res.status(200).json({
    reply: {
      id: reply.id,
      text: reply.text,
      username: reply.user.name,
      textComment: reply.comment.text,
      date: reply.createdAt
    }
  });
});

// Getting replies
router.get("/:slug/replies", async (req, res) => {
  const comment = await Comment.findOne({ slug: req.params.slug }).populate("replies");
  if (!comment) return res.status(404).json("Invalid Post ID");

  res.status(200).json({ commentReply: comment.replies });
});

module.exports = router;
