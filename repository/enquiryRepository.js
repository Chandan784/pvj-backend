
const db = require("../config/db");

class EnquiryRepository {
  // Get all enquiries
  async findAll(filters = {}) {
    const { search, status } = filters;

    let query = `
      SELECT
        id,
        name,
        phone,
        email,
        destination,
        travel_date AS travelDate,
        travelers,
        budget,
        message,
        status,
        quotation_status AS quotationStatus,
        quotation_amount AS quotationAmount,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM enquiries
    `;

    const conditions = [];
    const values = [];

    // Search
    if (search) {
      conditions.push(`
        (
          name LIKE ?
          OR phone LIKE ?
          OR email LIKE ?
          OR destination LIKE ?
        )
      `);

      const searchValue = `%${search}%`;

      values.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    // Status filter
    if (status && status !== "ALL") {
      conditions.push("status = ?");
      values.push(status);
    }

    // WHERE
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Latest first
    query += ` ORDER BY created_at DESC`;

    const [rows] = await db.execute(query, values);

    return rows;
  }

  // Get enquiry by ID
  async findById(id) {
    const [rows] = await db.execute(
      `
        SELECT
          id,
          name,
          phone,
          email,
          destination,
          travel_date AS travelDate,
          travelers,
          budget,
          message,
          status,
          quotation_status AS quotationStatus,
          quotation_amount AS quotationAmount,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM enquiries
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  }

  // Create enquiry
  async create(data) {
    const [result] = await db.execute(
      `
        INSERT INTO enquiries (
          name,
          phone,
          email,
          destination,
          travel_date,
          travelers,
          budget,
          message,
          status,
          quotation_status,
          quotation_amount
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.name,
        data.phone,
        data.email || null,
        data.destination,
        data.travelDate,
        data.travelers || 1,
        data.budget || null,
        data.message || null,
        data.status || "NEW",
        data.quotationStatus || "NONE",
        data.quotationAmount || null,
      ]
    );

    return await this.findById(result.insertId);
  }

  // Update enquiry
  // Updates enquiry information + lead status
  // + quotation status + quotation amount
  async update(id, data) {
    await db.execute(
      `
        UPDATE enquiries
        SET
          name = ?,
          phone = ?,
          email = ?,
          destination = ?,
          travel_date = ?,
          travelers = ?,
          budget = ?,
          message = ?,
          status = ?,
          quotation_status = ?,
          quotation_amount = ?
        WHERE id = ?
      `,
      [
        data.name,
        data.phone,
        data.email || null,
        data.destination,
        data.travelDate,
        data.travelers || 1,
        data.budget || null,
        data.message || null,
        data.status || "NEW",
        data.quotationStatus || "NONE",
        data.quotationAmount || null,
        id,
      ]
    );

    return await this.findById(id);
  }

  // Delete enquiry
  async delete(id) {
    const [result] = await db.execute(
      `
        DELETE FROM enquiries
        WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows > 0;
  }
}

module.exports = new EnquiryRepository();

