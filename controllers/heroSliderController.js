const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/* ================= CREATE ================= */

exports.createHeroSlide = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Image required",
      });
    }

    const {
      title,
      description,
      button_text,
      button_link,
      is_active,
      sort_order,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "hero-slides",
    });

    const image_url = result.secure_url;
    const public_id = result.public_id;

    // Save in database
    const [dbResult] = await db.query(
      `
      INSERT INTO hero_slides
      (
        title,
        description,
        image_url,
        public_id,
        button_text,
        button_link,
        is_active,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description || "",
        image_url,
        public_id,
        button_text || "Explore Now",
        button_link || "#",
        is_active ?? 1,
        sort_order || 0,
      ],
    );

    // Delete temporary file
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("File delete error:", err);
      }
    });

    res.status(201).json({
      message: "Hero slide created successfully",
      id: dbResult.insertId,
      data: {
        id: dbResult.insertId,
        title,
        description: description || "",
        image_url,
        button_text: button_text || "Explore Now",
        button_link: button_link || "#",
        is_active: is_active ?? 1,
        sort_order: sort_order || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


/* ================= READ ALL ================= */

exports.getHeroSlides = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM hero_slides
      ORDER BY sort_order ASC, id DESC
      `,
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


/* ================= READ ACTIVE ================= */

exports.getActiveHeroSlides = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        id,
        title,
        description,
        image_url,
        button_text,
        button_link,
        sort_order
      FROM hero_slides
      WHERE is_active = 1
      ORDER BY sort_order ASC, id DESC
      `,
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


/* ================= READ SINGLE ================= */

exports.getHeroSlideById = async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM hero_slides WHERE id=?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Hero slide not found",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


/* ================= UPDATE ================= */

exports.updateHeroSlide = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      title,
      description,
      button_text,
      button_link,
      is_active,
      sort_order,
    } = req.body;

    // Get existing slide
    const [rows] = await db.query(
      "SELECT * FROM hero_slides WHERE id=?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Hero slide not found",
      });
    }

    const oldSlide = rows[0];

    let image_url = oldSlide.image_url;
    let public_id = oldSlide.public_id;

    /*
      If new image is uploaded,
      delete old Cloudinary image
      and upload new image.
    */

    if (req.file) {

      // Delete old image from Cloudinary
      if (oldSlide.public_id) {
        await cloudinary.uploader.destroy(
          oldSlide.public_id,
        );
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "hero-slides",
        },
      );

      image_url = result.secure_url;
      public_id = result.public_id;

      // Delete temporary file
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(
            "File delete error:",
            err,
          );
        }
      });
    }

    // Update database
    await db.query(
      `
      UPDATE hero_slides
      SET
        title=?,
        description=?,
        image_url=?,
        public_id=?,
        button_text=?,
        button_link=?,
        is_active=?,
        sort_order=?
      WHERE id=?
      `,
      [
        title ?? oldSlide.title,
        description ?? oldSlide.description,
        image_url,
        public_id,
        button_text ?? oldSlide.button_text,
        button_link ?? oldSlide.button_link,
        is_active ?? oldSlide.is_active,
        sort_order ?? oldSlide.sort_order,
        id,
      ],
    );

    res.json({
      message: "Hero slide updated successfully",
      data: {
        id,
        title: title ?? oldSlide.title,
        description:
          description ?? oldSlide.description,
        image_url,
        button_text:
          button_text ?? oldSlide.button_text,
        button_link:
          button_link ?? oldSlide.button_link,
        is_active:
          is_active ?? oldSlide.is_active,
        sort_order:
          sort_order ?? oldSlide.sort_order,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


/* ================= DELETE ================= */

exports.deleteHeroSlide = async (req, res) => {
  try {
    const id = req.params.id;

    // Get existing slide
    const [rows] = await db.query(
      "SELECT * FROM hero_slides WHERE id=?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Hero slide not found",
      });
    }

    const public_id = rows[0].public_id;

    // Delete image from Cloudinary
    if (public_id) {
      await cloudinary.uploader.destroy(
        public_id,
      );
    }

    // Delete from database
    await db.query(
      "DELETE FROM hero_slides WHERE id=?",
      [id],
    );

    res.json({
      message: "Hero slide deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};