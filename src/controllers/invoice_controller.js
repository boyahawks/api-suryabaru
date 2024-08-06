const models = require("../utils/model");

module.exports = {
  async simpanInvoice(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var list_header_invoice = req.body.header_invoice;
    var list_detail_invoice = req.body.detail_invoice;
    var terbilang = req.body.terbilang;
    var total_invoice = req.body.total_invoice;

    // input header invoice
    var body_value_header = {
      nomor_invoice: list_header_invoice[0]["nomor_invoice"],
      kepada_pt: list_header_invoice[0]["kepada_pt"],
      nama_proyek: list_header_invoice[0]["nama_proyek"],
      alamat_proyek: list_header_invoice[0]["alamat_proyek"],
      nomor_surat_jalan: list_header_invoice[0]["nomor_surat_jalan"],
      persen_diskon: list_header_invoice[0]["persen_diskon"],
      total_diskon: list_header_invoice[0]["total_diskon"],
      total_rounded: list_header_invoice[0]["total_rounded"],
      tanggal_invoice: list_header_invoice[0]["tanggal_invoice"],
    };

    var insert_data_header = `INSERT INTO invoice SET ?;`;
    var hasil_insert_header = await models.transaksi(
      insert_data_header,
      body_value_header
    );
    if (hasil_insert_header[0] == true) {
      // input detail penawaran
      var id_header = hasil_insert_header[1].insertId;
      await list_detail_invoice.forEach(async (element) => {
        var body_value_detail = {
          id_invoice: id_header,
          nama_barang: element.nama_barang,
          satuan: element.satuan,
          qty: element.qty,
          harga_satuan: element.harga_satuan,
          harga_total: element.harga_total,
        };
        var insert_detail = `INSERT INTO isi_invoice SET ?;`;
        await models.transaksi(insert_detail, body_value_detail);
      });
      // INPUT KWITANSI
      var data_kwitansi = {
        id_invoice: id_header,
        terbilang: terbilang,
        total: total_invoice,
      };
      var insert_kwitansi = `INSERT INTO kwitansi SET ?;`;
      var hasil_insert_kwitansi = await models.transaksi(
        insert_kwitansi,
        data_kwitansi
      );
      if (hasil_insert_kwitansi[0] == true) {
        res.send({
          status: true,
          message: "Berhasil insert data!",
        });
      }
    } else {
      res.send({
        status: false,
        message: "Gagal insert data",
      });
    }
  },
};
