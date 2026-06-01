const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/* =========================================================
   CREATE PACKAGE
========================================================= */
exports.createPackage = async (req, res) => {
  try {
    const {
      destination_id,
      packageId,
      title,
      slug,
      duration,
      ratings,
      featured,
      status,
      createdAt,
      price,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image is required",
      });
    }

    const parsedPrice = typeof price === "string" ? JSON.parse(price) : price;

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "packages",
    });

    const thumbnail = uploadResult.secure_url;

    fs.unlink(req.file.path, () => {});

    const sql = `
      INSERT INTO packages
      (
        destination_id,
        packageId,
        title,
        slug,
        duration,
        ratings,
        thumbnail,
        featured,
        status,
        createdAt,
        startingFrom,
        originalPrice,
        currency,
        perText
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      destination_id,
      packageId,
      title,
      slug,
      duration,
      ratings,
      thumbnail,
      featured,
      status,
      createdAt,
      parsedPrice.startingFrom,
      parsedPrice.originalPrice,
      parsedPrice.currency,
      parsedPrice.per,
    ]);

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      id: result.insertId,
      thumbnail,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================================
   GET ALL PACKAGES
========================================================= */
exports.getPackages = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM packages ORDER BY id DESC");

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================================
   GET SINGLE PACKAGE
========================================================= */
exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT * FROM packages WHERE id=?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================================
   GET PACKAGES BY DESTINATION
========================================================= */
exports.getPackagesByDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM packages WHERE destination_id=? ORDER BY id DESC",
      [destinationId],
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================================
   UPDATE PACKAGE
========================================================= */
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      destination_id,
      packageId,
      title,
      slug,
      duration,
      ratings,
      featured,
      status,
      createdAt,
      price,
    } = req.body;

    const [rows] = await db.query("SELECT * FROM packages WHERE id=?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    let thumbnail = rows[0].thumbnail;

    const parsedPrice = typeof price === "string" ? JSON.parse(price) : price;

    if (req.file) {
      try {
        if (thumbnail) {
          const publicId = thumbnail.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`packages/${publicId}`);
        }

        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "packages",
        });

        thumbnail = uploadResult.secure_url;

        fs.unlink(req.file.path, () => {});
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
    }

    const sql = `
      UPDATE packages
      SET
        destination_id=?,
        packageId=?,
        title=?,
        slug=?,
        duration=?,
        ratings=?,
        thumbnail=?,
        featured=?,
        status=?,
        createdAt=?,
        startingFrom=?,
        originalPrice=?,
        currency=?,
        perText=?
      WHERE id=?
    `;

    await db.query(sql, [
      destination_id,
      packageId,
      title,
      slug,
      duration,
      ratings,
      thumbnail,
      featured,
      status,
      createdAt,
      parsedPrice.startingFrom,
      parsedPrice.originalPrice,
      parsedPrice.currency,
      parsedPrice.per,
      id,
    ]);

    res.json({
      success: true,
      message: "Package updated successfully",
      thumbnail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================================
   DELETE PACKAGE
========================================================= */
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT * FROM packages WHERE id=?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const thumbnail = rows[0].thumbnail;

    if (thumbnail) {
      try {
        const publicId = thumbnail.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`packages/${publicId}`);
      } catch (err) {
        console.log(err.message);
      }
    }

    await db.query("DELETE FROM packages WHERE id=?", [id]);

    res.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
