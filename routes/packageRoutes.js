const express = require("express");
const router = express.Router();

const upload = require("../config/multer");

const {
  createPackage,
  getPackages,
  getPackageById,
  getPackagesByDestination,
  updatePackage,
  deletePackage,
} = require("../controllers/packageController");

/* ================= CREATE ================= */
router.post("/", upload.single("thumbnail"), createPackage);

/* ================= GET ALL ================= */
router.get("/", getPackages);

/* ================= GET BY DESTINATION ================= */
router.get("/destination/:destinationId", getPackagesByDestination);

/* ================= GET SINGLE ================= */
router.get("/:id", getPackageById);

/* ================= UPDATE ================= */
router.put("/:id", upload.single("thumbnail"), updatePackage);

/* ================= DELETE ================= */
router.delete("/:id", deletePackage);

module.exports = router;
