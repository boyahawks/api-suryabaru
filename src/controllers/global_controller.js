const {
  select_global,
  transaksi,
  buildUpdateQuery,
  buildInsertQuery,
} = require("../utils/model");

module.exports = {
  async allData(req, res) {
    // VALIDASI GET NAMA TABEL / ROUTE
    console.log(`url ${req.originalUrl}`);
    let name_url = req.originalUrl;
    let checkUrl = name_url.split("/");
    let getTableName;
    if (checkUrl.length == 3) {
      getTableName = name_url.substring(name_url.lastIndexOf("/") + 1);
    } else if (checkUrl.length > 3) {
      getTableName = checkUrl[2];
    }

    res.header("Access-Control-Allow-Origin", "*");

    console.log(`get name tabel ${getTableName}`);

    // LIST QUERY
    var select_query;
    // PENAWARAN
    if (getTableName == "penawaran-detail") {
      var id = req.params.id;
      console.log(`data id penawaran ${id}`);
      select_query = `SELECT * FROM isi_penawaran WHERE id_penawaran='${id}'`;
    } else if (getTableName == "penawaran") {
      select_query = `SELECT * FROM penawaran ORDER BY tanggal_penawaran DESC`;
    }
    // INVOICE
    else if (getTableName == "invoice") {
      select_query = `SELECT * FROM invoice ORDER BY id_invoice DESC`;
    } else if (getTableName == "invoice-detail") {
      var id = req.params.id;
      select_query = `SELECT * FROM isi_invoice WHERE id_invoice='${id}'`;
    } else if (getTableName == "kwitansi-detail") {
      var id = req.params.id;
      select_query = `SELECT * FROM kwitansi WHERE id_invoice='${id}'`;
    }
    // PROYEK
    else if (getTableName == "proyek") {
      select_query = `SELECT * FROM proyek ORDER BY nama_proyek ASC`;
    }
    // BARANG
    else if (getTableName == "barang-part") {
      select_query = `SELECT * FROM barang ORDER BY id_barang DESC LIMIT 10`;
    } else if (getTableName == "barang-cari") {
      select_query = `SELECT * FROM barang WHERE nama_barang LIKE '%${req.body.nama_barang}%'`;
    } else if (getTableName == "client") {
      select_query = `SELECT * FROM client`;
    }
    // GLOBAL
    else {
      select_query = `SELECT * FROM ${getTableName} ORDER BY id DESC`;
    }
    // console.log(`query : ${select_query}`);
    var proses_data = await select_global(select_query);

    // console.log(proses_data);

    if (proses_data[0] == true) {
      res.send({
        status: true,
        message: "Berhasil ambil data!",
        data: proses_data[1],
      });
    } else {
      res.send({
        status: false,
        message: "Gagal ambil data!",
      });
    }
  },

  async editData(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    try {
      const name_url = req.originalUrl;
      const convert1 = name_url.substring(name_url.lastIndexOf("/") + 1);
      const nameTable = convert1.substring(convert1.lastIndexOf("-") + 1);

      const nameWhere = req.body.val;
      const cariWhere = req.body.cari;

      const bodyValue = { ...req.body };
      delete bodyValue.val;
      delete bodyValue.cari;

      // Pakai query builder untuk keamanan
      const updateData = buildUpdateQuery(
        nameTable,
        bodyValue,
        nameWhere,
        cariWhere
      );
      const hasil_update = await transaksi(updateData.query, updateData.values);

      if (hasil_update[0]) {
        res.send({
          status: true,
          message: "Berhasil update data!",
          data: hasil_update[1],
        });
      } else {
        res.send({
          status: false,
          message: "Gagal update data",
        });
      }
    } catch (error) {
      console.error("Error editData:", error.message);
      res.status(500).send({
        status: false,
        message: "Terjadi kesalahan server",
      });
    }
  },

  async insertData(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    try {
      const name_url = req.originalUrl;
      const nameTable = name_url.substring(name_url.lastIndexOf("/") + 1);
      const bodyValue = req.body;

      const insertData = buildInsertQuery(nameTable, bodyValue);
      const hasilInsert = await transaksi(insertData.query, insertData.values);

      if (hasilInsert[0]) {
        res.send({
          status: true,
          message: "Berhasil insert data!",
          data: hasilInsert[1],
        });
      } else {
        res.send({
          status: false,
          message: "Gagal insert data",
        });
      }
    } catch (error) {
      console.error("Error insertData:", error.message);
      res.status(500).send({
        status: false,
        message: "Terjadi kesalahan server",
      });
    }
  },

  async deleteData(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    let name_url = req.originalUrl;
    var convert1 = name_url.substring(name_url.lastIndexOf("/") + 1);
    var nameTable = convert1.substring(convert1.lastIndexOf("-") + 1);
    var jumlah_where = req.body.jumlah_where;

    var hasil_where;
    if (jumlah_where == "1") {
      hasil_where = `${req.body.val1}="${req.body.cari1}"`;
    } else if (jumlah_where == "2") {
      hasil_where = `${req.body.val1}="${req.body.cari1}" AND ${req.body.val2}="${req.body.cari2}"`;
    } else if (jumlah_where == "3") {
      hasil_where = `${req.body.val1}="${req.body.cari1}" AND ${req.body.val2}="${req.body.cari2}" AND ${req.body.val3}="${req.body.cari3}"`;
    } else if (jumlah_where == "4") {
      hasil_where = `${req.body.val1}="${req.body.cari1}" AND ${req.body.val2}="${req.body.cari2}" AND ${req.body.val3}="${req.body.cari3}" AND ${req.body.val4}="${req.body.cari4}"`;
    } else if (jumlah_where == "5") {
      hasil_where = `${req.body.val1}="${req.body.cari1}" AND ${req.body.val2}="${req.body.cari2}" AND ${req.body.val3}="${req.body.cari3}" AND ${req.body.val4}="${req.body.cari4}" AND ${req.body.val5}="${req.body.cari5}"`;
    }

    var delete_data = `DELETE FROM ${nameTable} WHERE ${hasil_where};`;
    var hasil_delete = await select_global(delete_data);
    if (hasil_delete[0] == true) {
      res.send({
        status: true,
        message: "Berhasil delete data!",
        data: hasil_delete[1],
      });
    } else {
      res.send({
        status: false,
        message: "Gagal delete data",
      });
    }
  },

  async validasiToken(req, res) {
    res.send({
      status: true,
      message: "Token valid",
    });
  },

  async historyActivity(req, res) {
    var nopeg = req.params.nopeg;
    var periode = req.params.periode.split("-");
    var tahun = periode[0];
    var bulan = periode[1];

    var query = `SELECT * FROM activity WHERE nopeg='${nopeg}' AND MONTH(tanggal_publish)='${bulan}' AND YEAR(tanggal_publish)='${tahun}' ORDER BY id DESC`;
    var hasil_query = await select_global(query);
    if (hasil_query[0] == true) {
      res.send({
        status: true,
        message: "Berhasil ambil data !",
        data: hasil_query[1],
      });
    } else {
      res.send({
        status: false,
        message: "Gagal ambil data !",
      });
    }
  },

  async uploadGambar(req, res) {
    var base64_file = req.body.file;
    var type_upload = req.body.type_upload;

    var randomstring = require("randomstring");
    var fs = require("fs");

    var bitmap = Buffer.from(base64_file, "base64");
    var stringRandom = randomstring.generate(5);
    var nama_file = stringRandom + ".png";

    if (type_upload == "upload_profile") {
      fs.writeFileSync("public/profile/" + nama_file, bitmap);
    } else if (type_upload == "upload_laporankerja") {
      fs.writeFileSync("public/laporan_kerja/" + nama_file, bitmap);
    }
    res.send({
      status: true,
      message: "Berhasil",
      nama_file: nama_file,
    });
  },
};
