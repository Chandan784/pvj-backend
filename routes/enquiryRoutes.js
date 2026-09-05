const express = require("express");

const enquiryController = require(
  "../controllers/enquiryController.js"
);

const router = express.Router();

// ============================================
// ENQUIRY ROUTES
// ============================================

// Get all enquiries
// GET /api/enquiries
router.get(
  "/",
  enquiryController.getAll
);

// Get single enquiry
// GET /api/enquiries/:id
router.get(
  "/:id",
  enquiryController.getById
);

// Create enquiry
// POST /api/enquiries
router.post(
  "/",
  enquiryController.create
);

// Update complete enquiry
// PUT /api/enquiries/:id
//
// Updates:
// - name
// - phone
// - email
// - destination
// - travelDate
// - travelers
// - budget
// - message
// - status
router.put(
  "/:id",
  enquiryController.update
);

// Delete enquiry
// DELETE /api/enquiries/:id
router.delete(
  "/:id",
  enquiryController.delete
);

module.exports = router;