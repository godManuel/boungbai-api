const express = require("express");
const router = express.Router();
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const { Course, validate } = require("../models/course");
const cloudinary = require("../utils/cloudinary");
const cloudinaryConfig = cloudinary.cloudinaryConfig;
const multer = require("../utils/multer");
const multerUploads = multer.multerUploads;
const datauri = multer.datauri;

// @DESC    Create a course
// @ROUTE   /api/courses
// @ACCESS  Private
router.post(
  "/",
  multerUploads.single("file"),
  cloudinaryConfig,
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    const file = datauri(req);

    cloudinary.uploader.upload(file.content, async (err, result) => {
      if (err) throw err;

      let course = new Course({
        name: req.body.name,
        author: req.body.author,
        price: req.body.price,
        isPublished: req.body.isPublished,
        category: req.body.category,
        image: result.secure_url,
      });

      const name = await Course.findOne({ name: req.body.name });
      if (name) return res.status(400).send("Course already exists!");

      await course.save();

      res.status(201).json({ course });
    });
  })
);

// @DESC    Get courses
// @ROUTE   /api/courses
// @ACCESS  Public
router.get("/", async (req, res) => {
  const courses = await Course.find();

  if (!courses) return res.status(404).json("No courses yet");

  res.status(200).json({ courses });
});

// @DESC    Update a course
// @ROUTE   /api/course/course-title
// @ACCESS  Private
router.put(
  "/:slug",
  multerUploads.single("file"),
  cloudinaryConfig,
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    const file = datauri(req);

    cloudinary.uploader.upload(file.content, async (err, result) => {
      if (err) throw err;

      let course = Course.updateOne(
        { slug: req.body.slug },
        {
          $set: {
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            isPublished: req.body.isPublished,
            image: result.secure_url,
          },
        },
        { new: true }
      );

      if (!course) return res.status(400).json("Course does not exist");

      res.status(200).json({ course });
    });
  })
);

// @DESC    Delete a category
// @ROUTE   /api/category/category-name
// @ACCESS  Private
router.delete(
  "/:slug",
  auth,
  asyncMiddleware(async (req, res) => {
    const course = await Course.deleteOne({ slug: req.params.slug });
    if (!course) return res.status(400).json("Course does not exist");

    res.status(200).json({ course });
  })
);

module.exports = router;
