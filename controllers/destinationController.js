const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/* =========================================================
   CREATE DESTINATION
========================================================= */
exports.createDestination = async (req, res) => {
  try {
    const { type, country, state, slug, description } = req.body;

    console.log(req.body);

    // CHECK IMAGE
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    // UPLOAD IMAGE TO CLOUDINARY
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "destinations",
    });

    const bannerImage = uploadResult.secure_url;

    // DELETE TEMP FILE
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log("Temp File Delete Error:", err);
      }
    });

    // INSERT INTO DB
    const sql = `
      INSERT INTO destinations
      (
        type,
        country,
        state,
        slug,
        bannerImage,
        description
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      type,
      country,
      state,
      slug,
      bannerImage,
      description,
    ]);

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      id: result.insertId,
      bannerImage,
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
   GET ALL DESTINATIONS
========================================================= */
exports.getDestinations = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT * FROM destinations ORDER BY id DESC",
    );

    res.json(result);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================================
   GET SINGLE DESTINATION
========================================================= */
exports.getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT * FROM destinations WHERE id=?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================================
   UPDATE DESTINATION
========================================================= */
exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const { type, country, state, slug, description } = req.body;

    console.log(req.body);
    console.log(req.file);
    console.log(id);

    // FIND OLD DESTINATION
    const [rows] = await db.query("SELECT * FROM destinations WHERE id=?", [
      id,
    ]);

    // CHECK EXISTS
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    // OLD IMAGE
    let bannerImage = rows[0].bannerImage;

    // IF NEW IMAGE EXISTS
    if (req.file) {
      try {
        // DELETE OLD IMAGE FROM CLOUDINARY
        if (bannerImage) {
          const oldPublicId = bannerImage.split("/").pop().split(".")[0];

          await cloudinary.uploader.destroy(`destinations/${oldPublicId}`);
        }

        // UPLOAD NEW IMAGE
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "destinations",
        });

        bannerImage = uploadResult.secure_url;

        // DELETE TEMP FILE
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.log("Temp File Delete Error:", err);
          }
        });
      } catch (cloudinaryError) {
        console.log(cloudinaryError);

        return res.status(500).json({
          success: false,
          error: cloudinaryError.message,
        });
      }
    }

    // UPDATE QUERY
    const sql = `
      UPDATE destinations
      SET
      type=?,
      country=?,
      state=?,
      slug=?,
      bannerImage=?,
      description=?
      WHERE id=?
    `;

    await db.query(sql, [
      type,
      country,
      state,
      slug,
      bannerImage,
      description,
      id,
    ]);

    res.json({
      success: true,
      message: "Destination updated successfully",
      bannerImage,
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
   DELETE DESTINATION
========================================================= */
exports.deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    // FIND DESTINATION
    const [rows] = await db.query("SELECT * FROM destinations WHERE id=?", [
      id,
    ]);

    // NOT FOUND
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    const bannerImage = rows[0].bannerImage;

    // DELETE CLOUDINARY IMAGE
    if (bannerImage) {
      try {
        const publicId = bannerImage.split("/").pop().split(".")[0];

        await cloudinary.uploader.destroy(`destinations/${publicId}`);
      } catch (cloudinaryError) {
        console.log("Cloudinary Delete Error:", cloudinaryError.message);
      }
    }

    // DELETE FROM DATABASE
    await db.query("DELETE FROM destinations WHERE id=?", [id]);

    res.json({
      success: true,
      message: "Destination deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
