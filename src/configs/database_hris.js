const mysql = require("mysql2/promise");

// Pool koneksi untuk hosting
const pool = mysql.createPool({
  host: "147.93.159.16", // Alamat host MySQL
  user: "bayu", // Username MySQL
  password: "mysqldbaap2025@Bayu", // Password MySQL
  database: "db_sba", // Nama database
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
