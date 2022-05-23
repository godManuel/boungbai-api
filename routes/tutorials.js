const cloudinary = require("../utils/cloudinary");
const cloudinaryConfig = cloudinary.cloudinaryConfig;
const multer = require("../utils/multer");
const multerUploads = multer.multerUploads;
const datauri = multer.datauri;
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const { Tutorial, validate } = require("../models/Tutorial");
const { Course } = require("../models/course");
const express = require("express");
const router = express.Router();
require("dotenv").config();

router.get("/create-course", async (req, res) => {
  res.render("course");
});

// @DESC    Get all tutorials
// @ROUTE   /api/tutorials
// @ACCESS  Private
router.get(
  "/tutorials",
  auth,
  asyncMiddleware(async (req, res) => {
    const tutorials = await Tutorial.find().sort({ date: -1 });
    res.status(200).json(tutorials);
  })
);

// @DESC    Get a tutorial
// @ROUTE   /api/tutorials/tutorial-name
// @ACCESS  Private
router.get(
  "/tutorials/slug",
  auth,
  asyncMiddleware(async (req, res) => {
    const tutorial = await Tutorial.findOne({ slug: req.body.slug });
    if (!tutorial) return res.status(404).json("Tutorial does not exist");
    res.status(200).json({ course });
  })
);

// @DESC    Upload tutorial
// @ROUTE   /api/courseId/tutorial
// @ACCESS  Private
router.post(
  "/:id/tutorials",
  multerUploads.single("file"),
  cloudinaryConfig,
  auth,
  async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(400).json("Course does not exist");

    const file = datauri(req);

    cloudinary.uploader.upload(
      file.content,
      {
        resource_type: "video",
        chunk_size: 6000000,
      },
      async (err, result) => {
        if (err) throw err;

        let tutorial = new Tutorial({
          name: req.body.name,
          video: result.secure_url,
        });

        const name = await Tutorial.findOne({ name: req.body.name });
        if (name) return res.status(400).json("Tutorial already exists!");

        await tutorial.save();

        course.tutorials.unshift(tutorial);
        await course.save();

        res.status(200).json({ tutorial });
      }
    );
  }
);

// @DESC    Update course
// @ROUTE   /api/courses/course-id
// @ACCESS  Private
router.put(
  "/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const tutorial = await Tutorial.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true }
    );

    if (!tutorial) return res.status(404).json("Invalid Tutorial ID");

    res.status(200).json({ tutorial });
  })
);

// @DESC    Delete course
// @ROUTE   /api/courses/courseId
// @ACCESS  Private
router.delete(
  "/tutorials/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const tutorial = await Tutorial.findByIdAndRemove(req.params.id);
    if (!tutorial) return res.status(404).json("Invalid Tutorial ID");

    res.status(200).json({ tutorial });
  })
);

module.exports = router;
