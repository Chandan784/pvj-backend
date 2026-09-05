const express = require("express");

const router = express.Router();

const {
    sendSignupOtp,
    verifySignupOtp,
    createPassword,
    login,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
} = require("../controllers/authController");

// ======================================================
// SIGNUP
// ======================================================

router.post(
    "/signup/send-otp",
    sendSignupOtp
);

router.post(
    "/signup/verify-otp",
    verifySignupOtp
);

router.post(
    "/signup/create-password",
    createPassword
);

// ======================================================
// LOGIN
// ======================================================

router.post(
    "/login",
    login
);

// ======================================================
// FORGOT PASSWORD
// ======================================================

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/reset-password/verify-otp",
    verifyResetOtp
);

router.post(
    "/reset-password",
    resetPassword
);

module.exports = router;