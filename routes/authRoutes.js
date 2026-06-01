const express = require("express");

const router = express.Router();

const multer = require("multer");

const upload = multer();

const { login, resetPassword } = require("../controllers/authController");

/* LOGIN */

router.post("/login", upload.none(), login);

/* RESET PASSWORD */

router.post("/reset-password", upload.none(), resetPassword);

module.exports = router;
