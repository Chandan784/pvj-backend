const express = require("express");

const router = express.Router();

const {
  createPackageDetails,
  getPackageDetails,
  getPackageDetailsById,
  updatePackageDetails,
  deletePackageDetails,
} = require("../controllers/packageDetailsController");

/* =========================================================
   CREATE PACKAGE DETAILS
========================================================= */
router.post("/", createPackageDetails);

/* =========================================================
   GET ALL PACKAGE DETAILS
========================================================= */
router.get("/", getPackageDetails);

/* =========================================================
   GET SINGLE PACKAGE DETAILS
========================================================= */
router.get("/:id", getPackageDetailsById);

/* =========================================================
   UPDATE PACKAGE DETAILS
========================================================= */
router.put("/:id", updatePackageDetails);

/* =========================================================
   DELETE PACKAGE DETAILS
========================================================= */
router.delete("/:id", deletePackageDetails);

module.exports = router;
