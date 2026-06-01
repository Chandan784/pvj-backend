const db = require("../config/db");

/* ======================================================
   LOGIN
====================================================== */

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(req.body);

    /* VALIDATION */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    /* CHECK USER */

    const sql = "SELECT * FROM users WHERE email=? AND password=? LIMIT 1";

    const [result] = await db.query(sql, [email, password]);

    /* USER NOT FOUND */

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = result[0];

    /* RESPONSE */

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        type: user.type,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ======================================================
   RESET PASSWORD
====================================================== */

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    /* VALIDATION */

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password required",
      });
    }

    /* CHECK USER */

    const checkSql = "SELECT * FROM users WHERE email=? LIMIT 1";

    const [userResult] = await db.query(checkSql, [email]);

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* UPDATE PASSWORD */

    const updateSql = "UPDATE users SET password=? WHERE email=?";

    await db.query(updateSql, [newPassword, email]);

    /* RESPONSE */

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
