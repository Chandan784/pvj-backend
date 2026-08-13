const express = require("express");

const router = express.Router();

const {
  createHeroSlide,
  getHeroSlides,
  getActiveHeroSlides,
  getHeroSlideById,
  updateHeroSlide,
  deleteHeroSlide,
} = require("../controllers/heroSliderController");

const upload = require("../config/multer");


/* ================= HERO SLIDES ================= */

// Create
router.post(
  "/",
  upload.single("image"),
  createHeroSlide
);

// Get all
router.get(
  "/",
  getHeroSlides
);

// Get active
router.get(
  "/active",
  getActiveHeroSlides
);

// Get single
router.get(
  "/:id",
  getHeroSlideById
);

// Update
router.put(
  "/:id",
  upload.single("image"),
  updateHeroSlide
);

// Delete
router.delete(
  "/:id",
  deleteHeroSlide
);

module.exports = router;