const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

const {
  uploadImage,
  getImages,
  getImageById,
  updateImage,
  deleteImage,
} = require("../controllers/reviewImagesController");

// ✅ Upload Image
router.post("/", upload.single("image"), uploadImage);

// ✅ Get All Images
router.get("/", getImages);

// ✅ Get Single Image
router.get("/:id", getImageById);

// ✅ Update Image
router.put("/:id", upload.single("image"), updateImage);

// ✅ Delete Image
router.delete("/:id", deleteImage);

module.exports = router;
