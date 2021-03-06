const express = require("express");
const router = express.Router();
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const { Course, validate } = require("../models/course");
const { Category } = require("../models/Category");
const cloudinary = require("../utils/cloudinary");
const cloudinaryConfig = cloudinary.cloudinaryConfig;
const multer = require("../utils/multer");
const multerUploads = multer.multerUploads;
const datauri = multer.datauri;

// @DESC    Create a course
// @ROUTE   /api/categoryId/courses
// @ACCESS  Private
router.post(
  "/:id/courses",
  multerUploads.single("file"),
  cloudinaryConfig,
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(400).json("Category does not exist");

    const file = datauri(req);

    cloudinary.uploader.upload(file.content, async (err, result) => {
      if (err) throw err;

      let course = new Course({
        name: req.body.name,
        author: req.body.author,
        price: req.body.price,
        isPublished: req.body.isPublished,
        image: result.secure_url,
      });

      const name = await Course.findOne({ name: req.body.name });
      if (name) return res.status(400).send("Course already exists!");

      await course.save();

      category.courses.unshift(course);
      await category.save();

      res.status(201).json({ course });
    });
  })
);

// @DESC    Get courses
// @ROUTE   /api/courses
// @ACCESS  Public
router.get("/courses", async (req, res) => {
  const courses = await Course.find().populate("tutorials");

  if (!courses) return res.status(404).json("No courses yet");

  res.status(200).json({ courses });
});

// @DESC    Get course
// @ROUTE   /api/courses/course-name
// @ACCESS  Public
router.get("/courses/:slug", async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug }).populate(
    "tutorials"
  );
  if (!course) return res.status(404).json("Course does not exist!");

  res.status(200).json({ course });
});

// @DESC    Update a course
// @ROUTE   /api/course/course-id
// @ACCESS  Private
router.put(
  "/courses/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const course = await Course.findByIdAndUpdate(
      { id: req.params.id },
      {
        $set: {
          title: req.body.title,
          author: req.body.author,
          price: req.body.price,
          isPublished: req.body.isPublished,
        },
      },
      { new: true }
    );

    if (!course) return res.status(400).json("Course does not exist");

    res.status(200).json({ course });
  })
);

// @DESC    Delete a category
// @ROUTE   /api/category/category-id
// @ACCESS  Private
router.delete(
  "/courses/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const course = await Course.findByIdAndRemove({ id: req.params.id });
    if (!course) return res.status(400).json("Course does not exist");

    res.status(200).json({ course });
  })
);

module.exports = router;
