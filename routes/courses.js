const cloudinary = require("../utils/cloudinary");
const cloudinaryConfig = cloudinary.cloudinaryConfig;
const multer = require("../utils/multer");
const multerUploads = multer.multerUploads;
const datauri = multer.datauri;
const _ = require("lodash");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const { Course, validate } = require("../models/course");
const express = require("express");
const router = express.Router();
require("dotenv").config();

router.get("/create-course", async (req, res) => {
  res.render("course");
});

// Getting all courses
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const courses = await Course.find().sort({ date: -1 });
    res.send(courses);
  })
);

// Getting a course
router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).send("Invalid Course ID");
    res.send(course);
  })
);

// Creating a course
router.post(
  "/",
  multerUploads.single("file"),
  cloudinaryConfig,
  async (req, res) => {
    const file = datauri(req);

    cloudinary.uploader.upload(
      file.content,
      {
        resource_type: "video",
        chunk_size: 6000000,
      },
      async (err, result) => {
        if (err) throw err;

        let course = new Course({
          name: req.body.name,
          author: req.body.author,
          price: req.body.price,
          video: result.secure_url,
        });

        const name = await Course.findOne({ name: req.body.name });
        if (name) return res.status(400).send("Course already exists!");

        course = await course.save();

        console.log(req.file);

        res.status(200).json({
          success: true,
          data: _.pick(course, [
            "_id",
            "name",
            "author",
            "price",
            "video",
            "createdAt",
          ]),
        });
      }
    );
  }
);

// Updating a course
router.put(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        author: req.body.author,
        price: req.body.price,
        isPublished: req.body.isPublished,
      },
      { new: true }
    );

    if (!course) return res.status(404).send("Invalid Course ID");

    res.send(course);
  })
);

// Deleting a course 
router.delete(
  "/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const course = await Course.findByIdAndRemove(req.params.id);
    if (!course) return res.status(404).send("Invalid Course ID");
    res.send(course);
  })
);

module.exports = router;
