const { getConnection } = require("../configs/database_hris"); // Asumsi ini berisi objek konfigurasi DB Anda

/**
 * Fungsi untuk melakukan SELECT query ke database.
 * Menggunakan Promise API untuk kode yang lebih bersih dengan async/await.
 *
 * @param {string} sqlQuery - String query SQL yang akan dieksekusi.
 * @returns {Promise<[boolean, Array<Object>]>} - Array berisi status keberhasilan (true) dan hasil query.
 * @throws {Error} - Melempar error jika ada masalah koneksi atau query.
 */
async function select_global(sqlQuery) {
  let connection; // Deklarasikan di luar try agar bisa diakses di finally
  try {
    // Dapatkan koneksi dari pool. Ini otomatis mengelola koneksi yang tersedia.
    connection = await getConnection();

    // Jalankan query.
    // Metode query() dari koneksi Promise mengembalikan array [rows, fields].
    const results = await connection.query(sqlQuery);
    // console.log("Query results:", results); // 👈 tambahkan ini

    return [true, results];
  } catch (error) {
    // Tangani error yang terjadi selama koneksi atau eksekusi query.
    console.error("Error in select_global:", error.message);
    throw error; // Lempar kembali error agar bisa ditangani di layer pemanggil
  } finally {
    // Pastikan koneksi selalu dilepaskan kembali ke pool, terlepas dari sukses atau gagal.
    if (connection) connection.release();
  }
}

/**
 * Fungsi untuk melakukan transaksi (INSERT, UPDATE, DELETE) ke database.
 * Menggunakan Promise API dan prepared statements untuk keamanan dan kejelasan.
 *
 * @param {string} sqlQuery - String query SQL yang akan dieksekusi (gunakan placeholder '?' untuk nilai).
 * @param {Array<any> | Object} params - Array nilai atau objek yang akan di-bind ke placeholder dalam query.
 * @returns {Promise<[boolean, Object]>} - Array berisi status keberhasilan (true) dan objek hasil query (misal: affectedRows, insertId).
 * @throws {Error} - Melempar error jika ada masalah koneksi atau query.
 */
async function transaksi(sqlQuery, params) {
  let connection;
  try {
    connection = await getConnection();

    // Jalankan query dengan prepared statement. Ini sangat penting untuk mencegah SQL Injection.
    // params akan secara otomatis di-escaped dan di-bind ke placeholder '?' dalam sqlQuery.
    const results = await connection.execute(sqlQuery, params);

    return [true, results];
  } catch (error) {
    console.error("Error in transaksi:", error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Ekspor fungsi-fungsi agar bisa digunakan di bagian lain aplikasi Anda
module.exports = {
  select_global,
  transaksi,
};
