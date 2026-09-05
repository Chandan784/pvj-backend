const db = require("../config/db");

const generateBookingId = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `BK-${year}${month}${day}-${randomNumber}`;
};

const bookingRepository = {
  // =====================================================
  // CREATE BOOKING
  // =====================================================

  async create(bookingData) {
    const bookingId = generateBookingId();

    const query = `
      INSERT INTO bookings (
        booking_id,
        customer_id,
        package_id,
        destination_id,
        travel_start_date,
        travel_end_date,
        traveler_count,
        total_amount,
        paid_amount,
        payment_status,
        status,
        booking_source
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      bookingId,
      bookingData.customerId,
      bookingData.packageId,
      bookingData.destinationId,
      bookingData.travelStartDate,
      bookingData.travelEndDate || null,
      bookingData.travelerCount,
      bookingData.totalAmount,
      bookingData.paidAmount || 0,
      bookingData.paymentStatus || "UNPAID",
      bookingData.status || "PENDING",
      bookingData.bookingSource || "WEBSITE",
    ];

    const [result] = await db.execute(query, values);

    return {
      id: result.insertId,
      bookingId,
    };
  },

  // =====================================================
  // GET ALL BOOKINGS
  // =====================================================

  async findAll({
    page = 1,
    limit = 10,
    search = "",
    status = "",
    paymentStatus = "",
  }) {
    const offset = (page - 1) * limit;

    let where = `
      WHERE b.deleted_at IS NULL
    `;

    const params = [];

    // ---------------------------------------------------
    // SEARCH
    // ---------------------------------------------------

    if (search) {
      where += `
        AND (
          b.booking_id LIKE ?
          OR c.name LIKE ?
          OR p.title LIKE ?
          OR d.country LIKE ?
        )
      `;

      const searchValue = `%${search}%`;

      params.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    // ---------------------------------------------------
    // STATUS FILTER
    // ---------------------------------------------------

    if (status) {
      where += `
        AND b.status = ?
      `;

      params.push(status);
    }

    // ---------------------------------------------------
    // PAYMENT STATUS FILTER
    // ---------------------------------------------------

    if (paymentStatus) {
      where += `
        AND b.payment_status = ?
      `;

      params.push(paymentStatus);
    }

    // ---------------------------------------------------
    // COUNT
    // ---------------------------------------------------

    const countQuery = `
      SELECT COUNT(*) AS total

      FROM bookings b

      INNER JOIN customers c
        ON c.id = b.customer_id

      INNER JOIN packages p
        ON p.id = b.package_id

      INNER JOIN destinations d
        ON d.id = b.destination_id

      ${where}
    `;

    const [countResult] = await db.execute(
      countQuery,
      params
    );

    // ---------------------------------------------------
    // DATA
    // ---------------------------------------------------

    const query = `
      SELECT
        b.id,
        b.booking_id,

        b.customer_id,
        c.name AS customer_name,

        b.package_id,
        p.title AS package_name,

        b.destination_id,
        d.country AS destination_name,

        b.travel_start_date,
        b.travel_end_date,

        b.traveler_count,

        b.total_amount,
        b.paid_amount,

        (
          b.total_amount - b.paid_amount
        ) AS due_amount,

        b.payment_status,
        b.status,
        b.booking_source,

        b.created_at,
        b.updated_at

      FROM bookings b

      INNER JOIN customers c
        ON c.id = b.customer_id

      INNER JOIN packages p
        ON p.id = b.package_id

      INNER JOIN destinations d
        ON d.id = b.destination_id

      ${where}

      ORDER BY b.created_at DESC

      LIMIT ? OFFSET ?
    `;

    const dataParams = [
      ...params,
      Number(limit),
      Number(offset),
    ];

    const [rows] = await db.execute(
      query,
      dataParams
    );

    return {
      data: rows,
      total: countResult[0].total,
      page: Number(page),
      limit: Number(limit),
    };
  },

  // =====================================================
  // GET SINGLE BOOKING
  // =====================================================

  async findById(id) {
    const query = `
      SELECT
        b.id,
        b.booking_id,

        b.customer_id,
        c.name AS customer_name,

        b.package_id,
        p.title AS package_name,

        b.destination_id,
        d.country AS destination_name,

        b.travel_start_date,
        b.travel_end_date,

        b.traveler_count,

        b.total_amount,
        b.paid_amount,

        (
          b.total_amount - b.paid_amount
        ) AS due_amount,

        b.payment_status,
        b.status,
        b.booking_source,

        b.created_at,
        b.updated_at

      FROM bookings b

      INNER JOIN customers c
        ON c.id = b.customer_id

      INNER JOIN packages p
        ON p.id = b.package_id

      INNER JOIN destinations d
        ON d.id = b.destination_id

      WHERE b.id = ?
        AND b.deleted_at IS NULL
    `;

    const [rows] = await db.execute(
      query,
      [id]
    );

    return rows[0] || null;
  },

  // =====================================================
  // UPDATE BOOKING
  // =====================================================

  async update(id, bookingData) {
    const query = `
      UPDATE bookings

      SET
        customer_id = ?,
        package_id = ?,
        destination_id = ?,
        travel_start_date = ?,
        travel_end_date = ?,
        traveler_count = ?,
        total_amount = ?,
        paid_amount = ?,
        payment_status = ?,
        status = ?,
        booking_source = ?

      WHERE id = ?
        AND deleted_at IS NULL
    `;

    const values = [
      bookingData.customerId,
      bookingData.packageId,
      bookingData.destinationId,
      bookingData.travelStartDate,
      bookingData.travelEndDate || null,
      bookingData.travelerCount,
      bookingData.totalAmount,
      bookingData.paidAmount || 0,
      bookingData.paymentStatus || "UNPAID",
      bookingData.status || "PENDING",
      bookingData.bookingSource || "WEBSITE",
      id,
    ];

    const [result] = await db.execute(
      query,
      values
    );

    return result.affectedRows > 0;
  },

  // =====================================================
  // SOFT DELETE BOOKING
  // =====================================================

  async softDelete(id) {
    const query = `
      UPDATE bookings

      SET
        deleted_at = CURRENT_TIMESTAMP

      WHERE id = ?
        AND deleted_at IS NULL
    `;

    const [result] = await db.execute(
      query,
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = bookingRepository;