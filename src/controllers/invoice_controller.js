const models = require("../utils/model");

module.exports = {
  async simpanInvoice(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    const list_header_invoice = req.body.header_invoice;
    const list_detail_invoice = req.body.detail_invoice;
    const terbilang = req.body.terbilang;
    const total_invoice = req.body.total_invoice;

    try {
      // === Insert Header Invoice ===
      const body_value_header = {
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

      const insertHeader = models.buildInsertQuery(
        "invoice",
        body_value_header
      );
      const hasil_insert_header = await models.transaksi(
        insertHeader.query,
        insertHeader.values
      );

      if (hasil_insert_header[0] === true) {
        const id_header = hasil_insert_header[1].insertId;

        // === Insert Detail Invoice ===
        for (const element of list_detail_invoice) {
          const body_value_detail = {
            id_invoice: id_header,
            nama_barang: element.nama_barang,
            satuan: element.satuan,
            qty: element.qty,
            harga_satuan: element.harga_satuan,
            harga_total: element.harga_total,
          };
          const insertDetail = models.buildInsertQuery(
            "isi_invoice",
            body_value_detail
          );
          await models.transaksi(insertDetail.query, insertDetail.values);
        }

        // === Insert Kwitansi ===
        const data_kwitansi = {
          id_invoice: id_header,
          terbilang: terbilang,
          total: total_invoice,
        };
        const insertKwitansi = models.buildInsertQuery(
          "kwitansi",
          data_kwitansi
        );
        const hasil_insert_kwitansi = await models.transaksi(
          insertKwitansi.query,
          insertKwitansi.values
        );

        if (hasil_insert_kwitansi[0] === true) {
          return res.send({
            status: true,
            message: "Berhasil insert data!",
          });
        }
      }

      // Kalau gagal masuk ke sini
      res.send({
        status: false,
        message: "Gagal insert data",
      });
    } catch (error) {
      console.error("Error simpanInvoice:", error.message);
      res.status(500).send({
        status: false,
        message: "Terjadi kesalahan pada server",
      });
    }
  },
};
