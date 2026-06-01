const express = require("express");
const router = express.Router();

const upload = require("../config/multer");

const {
  createDestination,
  getDestinations,
  updateDestination,
  deleteDestination,
  getDestinationById,
} = require("../controllers/destinationController");

/* ================= CREATE ================= */
router.post("/", upload.single("bannerImage"), createDestination);

/* ================= READ ALL ================= */
router.get("/", getDestinations);

/* ================= READ SINGLE ================= */
router.get("/:id", getDestinationById);

/* ================= UPDATE ================= */
router.put("/:id", upload.single("bannerImage"), updateDestination);

/* ================= DELETE ================= */
router.delete("/:id", deleteDestination);

module.exports = router;
