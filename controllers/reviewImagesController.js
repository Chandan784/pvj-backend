const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/* ================= CREATE ================= */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image required" });
    }

    const { review_id } = req.body || null;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "reviews",
    });

    const image_url = result.secure_url;
    const public_id = result.public_id;

    // Save in DB
    const [dbResult] = await db.query(
      "INSERT INTO review_images (image_url, public_id) VALUES (?, ?)",
      [image_url, public_id],
    );

    // Delete temp file safely
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("File delete error:", err);
    });

    res.json({
      message: "Image uploaded successfully",
      id: dbResult.insertId,
      url: image_url,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= READ ALL ================= */
exports.getImages = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM review_images ORDER BY id DESC",
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= READ SINGLE ================= */
exports.getImageById = async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query("SELECT * FROM review_images WHERE id=?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= UPDATE ================= */
exports.updateImage = async (req, res) => {
  try {
    const id = req.params.id;

    if (!req.file) {
      return res.status(400).json({ error: "Image required" });
    }

    // Get existing image
    const [rows] = await db.query("SELECT * FROM review_images WHERE id=?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const oldPublicId = rows[0].public_id;

    // Delete old image from Cloudinary
    await cloudinary.uploader.destroy(oldPublicId);

    // Upload new image
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "reviews",
    });

    const newUrl = result.secure_url;
    const newPublicId = result.public_id;

    // Update DB
    await db.query(
      "UPDATE review_images SET image_url=?, public_id=? WHERE id=?",
      [newUrl, newPublicId, id],
    );

    // Delete temp file safely
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("File delete error:", err);
    });

    res.json({
      message: "Image updated successfully",
      url: newUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE ================= */
exports.deleteImage = async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query("SELECT * FROM review_images WHERE id=?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const public_id = rows[0].public_id;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Delete from DB
    await db.query("DELETE FROM review_images WHERE id=?", [id]);

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
