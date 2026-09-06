const { getConnection } = require("../configs/database_hris");

/**
 * Fungsi untuk melakukan SELECT query ke database.
 * @param {string} sqlQuery - Query SQL SELECT.
 * @returns {Promise<[boolean, Array<Object>]>} - Status dan data hasil query.
 */
async function select_global(sqlQuery) {
  let connection;
  try {
    connection = await getConnection();

    // query() mengembalikan [rows, fields]
    const [rows] = await connection.query(sqlQuery);

    return [true, rows];
  } catch (error) {
    console.error("Error in select_global:", error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Fungsi untuk menjalankan transaksi INSERT, UPDATE, DELETE dengan prepared statement.
 * @param {string} sqlQuery - Query SQL dengan placeholder '?'
 * @param {Array<any>} params - Nilai yang di-bind ke placeholder
 * @returns {Promise<[boolean, Object]>} - Status dan hasil query (misal: affectedRows, insertId)
 */
async function transaksi(sqlQuery, params) {
  let connection;
  try {
    connection = await getConnection();

    // execute() mengembalikan [result, fields]
    const [result] = await connection.execute(sqlQuery, params);

    return [true, result];
  } catch (error) {
    console.error("Error in transaksi:", error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

function buildInsertQuery(tableName, dataObj) {
  const fields = Object.keys(dataObj).join(", ");
  const placeholders = Object.keys(dataObj)
    .map(() => "?")
    .join(", ");
  const values = Object.values(dataObj);
  return {
    query: `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`,
    values,
  };
}

function buildUpdateQuery(tableName, dataObj, whereField, whereValue) {
  const fields = Object.keys(dataObj)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(dataObj);
  return {
    query: `UPDATE ${tableName} SET ${fields} WHERE ${whereField} = ?`,
    values: [...values, whereValue],
  };
}

/**
 * Jalankan beberapa query dalam satu transaksi DB (commit/rollback).
 * @param {(connection: import('mysql2/promise').PoolConnection) => Promise<any>} callback
 */
async function withTransaction(callback) {
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return [true, result];
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (_) {
        /* ignore rollback error */
      }
    }
    console.error("Error in withTransaction:", error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  select_global,
  transaksi,
  buildInsertQuery,
  buildUpdateQuery,
  withTransaction,
};
