const db = require("../config/db");

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

// Parse JSON safely
const safeJSONParse = (value, defaultValue) => {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }

  // Already parsed by MySQL JSON type
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (err) {
    console.log("Invalid JSON:", value);

    // If plain text like "Accommodation"
    if (Array.isArray(defaultValue)) {
      return [value];
    }

    return defaultValue;
  }
};

// Convert any input to JSON string before saving
const toJSONString = (value, defaultValue) => {
  if (value === null || value === undefined || value === "") {
    return JSON.stringify(defaultValue);
  }

  // Already array/object
  if (typeof value !== "string") {
    return JSON.stringify(value);
  }

  // Already valid JSON string
  try {
    JSON.parse(value);
    return value;
  } catch (err) {
    // Plain string
    if (Array.isArray(defaultValue)) {
      return JSON.stringify([value]);
    }

    return JSON.stringify(defaultValue);
  }
};

/* =========================================================
   CREATE PACKAGE DETAILS
========================================================= */

exports.createPackageDetails = async (req, res) => {
  try {
    const {
      package_id,
      overview,
      inclusions,
      exclusions,
      itinerary,
      keyInfo,
      termsAndConditions,
      highlights,
      citiesCovered,
      tags,
    } = req.body;

    const [packageRows] = await db.query(
      "SELECT id FROM packages WHERE id = ?",
      [package_id]
    );

    if (!packageRows.length) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM package_details WHERE package_id = ?",
      [package_id]
    );

    if (existing.length) {
      return res.status(400).json({
        success: false,
        message: "Package details already exist",
      });
    }

    const sql = `
      INSERT INTO package_details
      (
        package_id,
        overview,
        inclusions,
        exclusions,
        itinerary,
        keyInfo,
        termsAndConditions,
        highlights,
        citiesCovered,
        tags
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      package_id,
      overview || "",
      toJSONString(inclusions, []),
      toJSONString(exclusions, []),
      toJSONString(itinerary, []),
      toJSONString(keyInfo, []),
      toJSONString(termsAndConditions, []),
      toJSONString(highlights, []),
      toJSONString(citiesCovered, []),
      toJSONString(tags, []),
    ]);

    return res.status(201).json({
      success: true,
      message: "Package details created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================================
   GET ALL PACKAGE DETAILS
========================================================= */

exports.getPackageDetails = async (req, res) => {
  try {
    const sql = `
      SELECT
        pd.*,
        p.id AS package_db_id,
        p.packageId,
        p.destination_id,
        p.title,
        p.slug,
        p.duration,
        p.ratings,
        p.thumbnail,
        p.featured,
        p.status,
        p.createdAt,
        p.startingFrom,
        p.originalPrice,
        p.currency,
        p.perText
      FROM package_details pd
      LEFT JOIN packages p
      ON p.id = pd.package_id
      ORDER BY pd.id DESC
    `;

    const [rows] = await db.query(sql);

    const formatted = rows.map((item) => ({
      ...item,
      inclusions: safeJSONParse(item.inclusions, []),
      exclusions: safeJSONParse(item.exclusions, []),
      itinerary: safeJSONParse(item.itinerary, []),
      keyInfo: safeJSONParse(item.keyInfo, []),
      termsAndConditions: safeJSONParse(item.termsAndConditions, []),
      highlights: safeJSONParse(item.highlights, []),
      citiesCovered: safeJSONParse(item.citiesCovered, []),
      tags: safeJSONParse(item.tags, []),
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================================
   GET SINGLE PACKAGE DETAILS
========================================================= */

exports.getPackageDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        pd.*,
        p.id AS package_db_id,
        p.packageId,
        p.destination_id,
        p.title,
        p.slug,
        p.duration,
        p.ratings,
        p.thumbnail,
        p.featured,
        p.status,
        p.createdAt,
        p.startingFrom,
        p.originalPrice,
        p.currency,
        p.perText
      FROM package_details pd
      LEFT JOIN packages p
      ON p.id = pd.package_id
      WHERE pd.package_id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [id]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Package details not found",
      });
    }

    const item = rows[0];

    return res.status(200).json({
      success: true,
      data: {
        ...item,
        inclusions: safeJSONParse(item.inclusions, []),
        exclusions: safeJSONParse(item.exclusions, []),
        itinerary: safeJSONParse(item.itinerary, []),
        keyInfo: safeJSONParse(item.keyInfo, []),
        termsAndConditions: safeJSONParse(item.termsAndConditions, []),
        highlights: safeJSONParse(item.highlights, []),
        citiesCovered: safeJSONParse(item.citiesCovered, []),
        tags: safeJSONParse(item.tags, []),
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================================
   UPDATE PACKAGE DETAILS
========================================================= */

exports.updatePackageDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      package_id,
      overview,
      inclusions,
      exclusions,
      itinerary,
      keyInfo,
      termsAndConditions,
      highlights,
      citiesCovered,
      tags,
    } = req.body;

    const [rows] = await db.query(
      "SELECT id FROM package_details WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Package details not found",
      });
    }

    const sql = `
      UPDATE package_details
      SET
        package_id = ?,
        overview = ?,
        inclusions = ?,
        exclusions = ?,
        itinerary = ?,
        keyInfo = ?,
        termsAndConditions = ?,
        highlights = ?,
        citiesCovered = ?,
        tags = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.query(sql, [
      package_id,
      overview || "",
      toJSONString(inclusions, []),
      toJSONString(exclusions, []),
      toJSONString(itinerary, []),
      toJSONString(keyInfo, []),
      toJSONString(termsAndConditions, []),
      toJSONString(highlights, []),
      toJSONString(citiesCovered, []),
      toJSONString(tags, []),
      id,
    ]);

    return res.status(200).json({
      success: true,
      message: "Package details updated successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================================
   DELETE PACKAGE DETAILS
========================================================= */

exports.deletePackageDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT id FROM package_details WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Package details not found",
      });
    }

    await db.query("DELETE FROM package_details WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Package details deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};