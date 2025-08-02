const mariadb = require("mariadb");

// const pool = mariadb.createPool({ // local macbook
//   host: "127.0.0.1", // Alamat host MariaDB
//   user: "root", // Username MariaDB
//   password: "sahabatku", // Password MariaDB
//   database: "db_sba", // Nama database
//   connectionLimit: 5, // Maksimal koneksi simultan
// });
const pool = mariadb.createPool({  // hosting
  host: "147.93.159.16", // Alamat host MariaDB
  user: "bayu", // Username MariaDB
  password: "mysqldbaap2025", // Password MariaDB
  database: "db_sba", // Nama database
  connectionLimit: 5, // Maksimal koneksi simultan
});

async function getConnection() {
  let conn;
  try {
    conn = await pool.getConnection(); // <-- ini yang benar
    console.log("Koneksi ke MariaDB berhasil!");
    return conn;
  } catch (err) {
    console.error("Gagal terhubung ke MariaDB: " + err);
    throw err;
  }
}

module.exports = {
  getConnection,
};
