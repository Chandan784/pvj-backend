require("dotenv").config();

const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ======================================================
// TEST DATABASE CONNECTION
// ======================================================

async function testDatabase() {
  try {
    const connection = await db.getConnection();

    console.log("✅ MySQL connected successfully!");

    const [rows] = await connection.query(
      "SELECT 1 AS test"
    );

    console.log("Database test:", rows);

    connection.release();

  } catch (error) {
    console.error("❌ MySQL connection failed:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
  }
}

testDatabase();

module.exports = db;