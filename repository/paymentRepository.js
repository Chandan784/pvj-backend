const db = require("../config/db");

class PaymentRepository {
  // CREATE PAYMENT
  async create(payment) {
    const sql = `
      INSERT INTO payments (
        payment_id,
        booking_id,
        customer_id,
        amount,
        payment_method,
        transaction_id,
        status,
        payment_date,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      payment.payment_id,
      payment.booking_id,
      payment.customer_id,
      payment.amount,
      payment.payment_method,
      payment.transaction_id || null,
      payment.status || "PENDING",
      payment.payment_date || new Date(),
      payment.notes || null,
    ]);

    return this.findById(result.insertId);
  }

  // GET ALL PAYMENTS
  async findAll(filters = {}) {
    let sql = `
      SELECT
        p.*,

        c.customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,

        b.booking_id,
        b.destination,
        b.package_name

      FROM payments p

      LEFT JOIN customers c
        ON c.id = p.customer_id

      LEFT JOIN bookings b
        ON b.id = p.booking_id

      WHERE 1 = 1
    `;

    const params = [];

    // STATUS FILTER
    if (filters.status) {
      sql += ` AND p.status = ?`;
      params.push(filters.status);
    }

    // PAYMENT METHOD FILTER
    if (filters.payment_method) {
      sql += ` AND p.payment_method = ?`;
      params.push(filters.payment_method);
    }

    // BOOKING FILTER
    if (filters.booking_id) {
      sql += ` AND p.booking_id = ?`;
      params.push(filters.booking_id);
    }

    // CUSTOMER FILTER
    if (filters.customer_id) {
      sql += ` AND p.customer_id = ?`;
      params.push(filters.customer_id);
    }

    // SEARCH
    if (filters.search) {
      sql += `
        AND (
          p.payment_id LIKE ?
          OR p.transaction_id LIKE ?
          OR c.name LIKE ?
          OR c.customer_id LIKE ?
          OR b.booking_id LIKE ?
          OR b.destination LIKE ?
        )
      `;

      const search = `%${filters.search}%`;

      params.push(
        search,
        search,
        search,
        search,
        search,
        search
      );
    }

    sql += `
      ORDER BY p.created_at DESC
    `;

    const [rows] = await db.execute(sql, params);

    return rows;
  }

  // GET PAYMENT BY ID
  async findById(id) {
    const sql = `
      SELECT
        p.*,

        c.customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,

        b.booking_id,
        b.destination,
        b.package_name,
        b.travel_date,
        b.return_date,
        b.total_amount AS booking_total_amount

      FROM payments p

      LEFT JOIN customers c
        ON c.id = p.customer_id

      LEFT JOIN bookings b
        ON b.id = p.booking_id

      WHERE p.id = ?

      LIMIT 1
    `;

    const [rows] = await db.execute(sql, [id]);

    return rows[0] || null;
  }

  // GET PAYMENTS FOR A BOOKING
  async findByBookingId(bookingId) {
    const sql = `
      SELECT
        p.*,

        c.customer_id,
        c.name AS customer_name,
        c.email AS customer_email

      FROM payments p

      LEFT JOIN customers c
        ON c.id = p.customer_id

      WHERE p.booking_id = ?

      ORDER BY p.payment_date DESC
    `;

    const [rows] = await db.execute(sql, [bookingId]);

    return rows;
  }

  // UPDATE PAYMENT
  async update(id, payment) {
    const sql = `
      UPDATE payments
      SET
        amount = ?,
        payment_method = ?,
        transaction_id = ?,
        payment_date = ?,
        notes = ?
      WHERE id = ?
    `;

    const [result] = await db.execute(sql, [
      payment.amount,
      payment.payment_method,
      payment.transaction_id || null,
      payment.payment_date,
      payment.notes || null,
      id,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }

  // UPDATE PAYMENT STATUS
  async updateStatus(id, status) {
    const sql = `
      UPDATE payments
      SET status = ?
      WHERE id = ?
    `;

    const [result] = await db.execute(sql, [
      status,
      id,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }

  // PAYMENT SUMMARY
  async getSummary() {
    const sql = `
      SELECT

        COUNT(*) AS total_transactions,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'PAID'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS total_collected,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'PENDING'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS total_pending,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'REFUNDED'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS total_refunded,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'FAILED'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS total_failed

      FROM payments
    `;

    const [rows] = await db.execute(sql);

    return rows[0];
  }

  // TOTAL PAID FOR A BOOKING
  async getBookingPaidAmount(bookingId) {
    const sql = `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN status = 'PAID'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS paid_amount
      FROM payments
      WHERE booking_id = ?
    `;

    const [rows] = await db.execute(sql, [bookingId]);

    return rows[0].paid_amount;
  }

  // BOOKING PAYMENT SUMMARY
  async getBookingPaymentSummary(bookingId) {
    const sql = `
      SELECT

        b.id,
        b.booking_id,
        b.total_amount,

        COALESCE(
          SUM(
            CASE
              WHEN p.status = 'PAID'
              THEN p.amount
              ELSE 0
            END
          ),
          0
        ) AS paid_amount,

        (
          b.total_amount -
          COALESCE(
            SUM(
              CASE
                WHEN p.status = 'PAID'
                THEN p.amount
                ELSE 0
              END
            ),
            0
          )
        ) AS due_amount

      FROM bookings b

      LEFT JOIN payments p
        ON p.booking_id = b.id

      WHERE b.id = ?

      GROUP BY
        b.id,
        b.booking_id,
        b.total_amount
    `;

    const [rows] = await db.execute(sql, [bookingId]);

    return rows[0] || null;
  }
}

module.exports = new PaymentRepository();