const mysql = require("mysql2/promise");

// Pool koneksi untuk hosting
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // koneksi paralel
  queueLimit: 0,
  connectTimeout: 30000, // 30 detik
  acquireTimeout: 30000, // 30 detik
  timezone: "+07:00",
  dateStrings: true,
});

async function getConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Koneksi ke MySQL berhasil!");
    return connection;
  } catch (err) {
    console.error("Gagal terhubung ke MySQL: " + err.message);
    throw err;
  }
}

module.exports = {
  getConnection,
};
