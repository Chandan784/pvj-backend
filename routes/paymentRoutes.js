const express = require("express");

const paymentController = require("../controllers/paymentController");

const router = express.Router();

// Summary
router.get(
  "/summary",
  paymentController.summary
);

// Get all payments
router.get(
  "/",
  paymentController.getAll
);

// Get payment by ID
router.get(
  "/:id",
  paymentController.getById
);

// Get payments of booking
router.get(
  "/booking/:bookingId",
  paymentController.getByBooking
);

// Create payment
router.post(
  "/",
  paymentController.create
);

// Update payment
router.patch(
  "/:id",
  paymentController.update
);

// Update payment status
router.patch(
  "/:id/status",
  paymentController.updateStatus
);

module.exports = router;