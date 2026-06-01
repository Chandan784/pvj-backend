const db = require("../config/db");

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

    // CHECK PACKAGE EXISTS
    const [packageRows] = await db.query(
      "SELECT * FROM packages WHERE id = ?",
      [package_id],
    );

    if (packageRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // CHECK DETAILS ALREADY EXISTS
    const [existing] = await db.query(
      "SELECT * FROM package_details WHERE package_id = ?",
      [package_id],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Package details already added",
      });
    }

    // INSERT
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
      overview,
      JSON.stringify(inclusions || []),
      JSON.stringify(exclusions || []),
      JSON.stringify(itinerary || []),
      JSON.stringify(keyInfo || {}),
      JSON.stringify(termsAndConditions || []),
      JSON.stringify(highlights || []),
      JSON.stringify(citiesCovered || []),
      JSON.stringify(tags || []),
    ]);

    res.status(201).json({
      success: true,
      message: "Package details created successfully",
      id: result.insertId,
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
   GET ALL PACKAGE DETAILS
========================================================= */
exports.getPackageDetails = async (req, res) => {
  try {
    const sql = `
      SELECT 
        pd.*,

        p.id as package_db_id,
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

    const [result] = await db.query(sql);

    const formatted = result.map((item) => ({
      ...item,

      inclusions: JSON.parse(item.inclusions || "[]"),

      exclusions: JSON.parse(item.exclusions || "[]"),

      itinerary: JSON.parse(item.itinerary || "[]"),

      keyInfo: JSON.parse(item.keyInfo || "{}"),

      termsAndConditions: JSON.parse(item.termsAndConditions || "[]"),

      highlights: JSON.parse(item.highlights || "[]"),

      citiesCovered: JSON.parse(item.citiesCovered || "[]"),

      tags: JSON.parse(item.tags || "[]"),
    }));

    res.json(formatted);
  } catch (error) {
    console.log(error);

    res.status(500).json({
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

        p.id as package_db_id,
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

      WHERE pd.id = ?
    `;

    const [result] = await db.query(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package details not found",
      });
    }

    const item = result[0];

    res.json({
      ...item,

      inclusions: JSON.parse(item.inclusions || "[]"),

      exclusions: JSON.parse(item.exclusions || "[]"),

      itinerary: JSON.parse(item.itinerary || "[]"),

      keyInfo: JSON.parse(item.keyInfo || "{}"),

      termsAndConditions: JSON.parse(item.termsAndConditions || "[]"),

      highlights: JSON.parse(item.highlights || "[]"),

      citiesCovered: JSON.parse(item.citiesCovered || "[]"),

      tags: JSON.parse(item.tags || "[]"),
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

    // CHECK EXISTS
    const [rows] = await db.query(
      "SELECT * FROM package_details WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package details not found",
      });
    }

    // UPDATE
    const sql = `
      UPDATE package_details
      SET
        package_id=?,
        overview=?,
        inclusions=?,
        exclusions=?,
        itinerary=?,
        keyInfo=?,
        termsAndConditions=?,
        highlights=?,
        citiesCovered=?,
        tags=?
      WHERE id=?
    `;

    await db.query(sql, [
      package_id,
      overview,
      JSON.stringify(inclusions || []),
      JSON.stringify(exclusions || []),
      JSON.stringify(itinerary || []),
      JSON.stringify(keyInfo || {}),
      JSON.stringify(termsAndConditions || []),
      JSON.stringify(highlights || []),
      JSON.stringify(citiesCovered || []),
      JSON.stringify(tags || []),
      id,
    ]);

    res.json({
      success: true,
      message: "Package details updated successfully",
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
   DELETE PACKAGE DETAILS
========================================================= */
exports.deletePackageDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // CHECK EXISTS
    const [rows] = await db.query(
      "SELECT * FROM package_details WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Package details not found",
      });
    }

    // DELETE
    await db.query("DELETE FROM package_details WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Package details deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
