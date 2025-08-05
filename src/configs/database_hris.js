const mysql = require("mysql2/promise");

// Pool koneksi untuk hosting
const pool = mysql.createPool({
  host: "147.93.159.16", // Alamat host MySQL
  user: "bayu", // Username MySQL
  password: "mysqldbaap2025@Bayu", // Password MySQL
  database: "db_sba", // Nama database
  waitForConnections: true,
  connectionLimit: 5, // Maksimal koneksi simultan
  queueLimit: 0,
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
