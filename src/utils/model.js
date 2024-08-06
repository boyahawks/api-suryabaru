const config = require("../configs/database_hris");
const mysql = require("mysql");
const pool = mysql.createPool(config);

async function select_global(value) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) resolve([false, err]);
      connection.query(value, function (error, results) {
        if (error) resolve([false, error]);
        else resolve([true, results]);
      });
      connection.release();
    });
  });
}

async function transaksi(value, form) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) resolve([false, err]);
      connection.query(value, [form], function (error, results) {
        if (error) resolve([false, error]);
        else resolve([true, results]);
      });
      connection.release();
    });
  });
}

module.exports = {
  select_global,
  transaksi,
};
