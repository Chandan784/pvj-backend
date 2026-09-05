const pool = require("../config/db");
const generateCustomerId = require("../utils/generateCutomerId");

const customerRepository = {

 async create(data) {
  const {
    name,
    email,
    phone,
    address,
  } = data;

  // First create customer
  const [result] = await pool.execute(
    `
    INSERT INTO customers
    (
      name,
      email,
      phone,
      address,
      customer_id
    )
    VALUES (?, ?, ?, ?, NULL)
    `,
    [
      name,
      email,
      phone,
      address,
    ]
  );

  // MySQL generated numeric ID
  const id = result.insertId;

  // Generate public customer ID
  const customerId = generateCustomerId(id);

  // Save generated customer ID
  await pool.execute(
    `
    UPDATE customers
    SET customer_id = ?
    WHERE id = ?
    `,
    [
      customerId,
      id,
    ]
  );

  console.log("========== CUSTOMER CREATED ==========");
  console.log("Database ID:", id);
  console.log("Customer ID:", customerId);
  console.log("======================================");

  return id;
},

  async findById(id) {

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        customer_id,
        name,
        email,
        phone,
        address,
        created_at,
        updated_at
      FROM customers
      WHERE id = ?
      `,
      [id]
    );

    return rows[0] || null;
  },

  async findAll() {

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        customer_id,
        name,
        email,
        phone,
        address,
        created_at,
        updated_at
      FROM customers
      ORDER BY id DESC
      `
    );

    return rows;
  },

  async update(id, data) {

    const {
      name,
      email,
      phone,
      address,
    } = data;

    const [result] = await pool.execute(
      `
      UPDATE customers
      SET
        name = ?,
        email = ?,
        phone = ?,
        address = ?
      WHERE id = ?
      `,
      [
        name,
        email,
        phone,
        address,
        id,
      ]
    );

    return result;
  },

  async delete(id) {

    const [result] = await pool.execute(
      `
      DELETE FROM customers
      WHERE id = ?
      `,
      [id]
    );

    return result;
  },

  async findByCustomerId(customerId) {

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        customer_id,
        name,
        email,
        phone,
        address,
        created_at,
        updated_at
      FROM customers
      WHERE customer_id = ?
      `,
      [customerId]
    );

    return rows[0] || null;
  },
};

module.exports = customerRepository;