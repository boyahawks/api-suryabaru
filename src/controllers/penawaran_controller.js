const models = require("../utils/model");

module.exports = {
  async simpanPenawaranHarga(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var list_header_penawaran = req.body.header_penawaran;
    var list_detail_penawaran = req.body.detail_penawaran;

    // input header penawaran
    var body_value_header = {
      kepada_nama: list_header_penawaran[0]["kepada_nama"],
      kepada_pt: list_header_penawaran[0]["kepada_pt"],
      proyek: list_header_penawaran[0]["proyek"],
      tanggal_penawaran: list_header_penawaran[0]["tanggal_penawaran"],
    };

    var insert_data_header_penawaran = `INSERT INTO penawaran SET ?;`;
    var hasil_insert_header = await models.transaksi(
      insert_data_header_penawaran,
      body_value_header
    );
    if (hasil_insert_header[0] == true) {
      // input detail penawaran
      var id_header = hasil_insert_header[1].insertId;
      await list_detail_penawaran.forEach(async (element) => {
        var body_value_detail = {
          id_penawaran: id_header,
          nama_barang: element.nama_barang,
          satuan: element.satuan,
          qty: element.qty,
          harga_satuan: element.harga_satuan,
          harga_total: element.harga_total,
        };
        var insert_detail_penawaran = `INSERT INTO isi_penawaran SET ?;`;
        await models.transaksi(insert_detail_penawaran, body_value_detail);
        var body_barang = {
          nama_barang: element.nama_barang,
          satuan: element.satuan,
          qty: element.qty,
          harga_satuan: element.harga_satuan,
          harga_total: element.harga_total,
        };
        var insert_barang = `INSERT INTO barang SET ?;`;
        await models.transaksi(insert_barang, body_barang);
      });
      res.send({
        status: true,
        message: "Berhasil insert data!",
      });
    } else {
      res.send({
        status: false,
        message: "Gagal insert data",
      });
    }
  },
};
