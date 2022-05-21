const express = require("express");
const router = express.Router();
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const { Category, validate } = require("../models/Category");
const cloudinary = require("../utils/cloudinary");
const cloudinaryConfig = cloudinary.cloudinaryConfig;
const multer = require("../utils/multer");
const multerUploads = multer.multerUploads;
const datauri = multer.datauri;

// @DESC    Create a category
// @ROUTE   /api/category
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

      let category = new Category({
        name: req.body.name,
        image: result.secure_url,
      });

      const name = await Category.findOne({ name: req.body.name });
      if (name) return res.status(400).send("Category already exists!");

      await category.save();

      res.status(201).json({ category });
    });
  })
);

// @DESC    Get categories
// @ROUTE   /api/category
// @ACCESS  Public
router.get("/", async (req, res) => {
  const categories = await Category.find().populate("courses");

  if (!categories) return res.status(404).json("No categories yet");

  res.status(200).json({ categories });
});

router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(400).json("Course does not exist!");

  res.status(200).json({ category });
});

// @DESC    Update a category
// @ROUTE   /api/category/category-name
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

      let category = Category.updateOne(
        { slug: req.body.slug },
        {
          $set: {
            name: req.body.name,
            image: result.secure_url,
          },
        },
        { new: true }
      );

      if (!category) return res.status(400).json("Category does not exist");

      res.status(200).json({ category });
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
    const category = await Category.deleteOne({ slug: req.params.slug });
    if (!category) return res.status(400).json("Category does not exist");

    res.status(200).json({ category });
  })
);

module.exports = router;
