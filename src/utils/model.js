const config = require("../configs/database_hris");
const mysql = require("mysql");
const pool = mysql.createPool(config);

// async function select_global(value) {
//   return new Promise((resolve, reject) => {
//     pool.getConnection(function (err, connection) {
//       if (err) resolve([false, err]);
//       connection.query(value, function (error, results) {
//         if (error) resolve([false, error]);
//         else resolve([true, results]);
//       });
//       connection.release();
//     });
//   });
// }

// async function transaksi(value, form) {
//   return new Promise((resolve, reject) => {
//     pool.getConnection(function (err, connection) {
//       if (err) resolve([false, err]);
//       connection.query(value, [form], function (error, results) {
//         if (error) resolve([false, error]);
//         else resolve([true, results]);
//       });
//       connection.release();
//     });
//   });
// }
async function select_global(value) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
        return;
      }
      connection.query(value, function (error, results) {
        connection.release(); // Release the connection back to the pool
        if (error) reject(error);
        else resolve([true, results]);
      });
    });
  });
}

async function transaksi(value, form) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
        return;
      }
      connection.query(value, [form], function (error, results) {
        connection.release(); // Release the connection back to the pool
        if (error) reject(error);
        else resolve([true, results]);
      });
    });
  });
}

module.exports = {
  select_global,
  transaksi,
};
