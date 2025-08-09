const models = require("../utils/model");

module.exports = {
  async simpanPenawaranHarga(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    const list_header_penawaran = req.body.header_penawaran;
    const list_detail_penawaran = req.body.detail_penawaran;

    try {
      // === Insert Header Penawaran ===
      const body_value_header = {
        kepada_nama: list_header_penawaran[0]["kepada_nama"],
        kepada_pt: list_header_penawaran[0]["kepada_pt"],
        proyek: list_header_penawaran[0]["proyek"],
        tanggal_penawaran: list_header_penawaran[0]["tanggal_penawaran"],
      };

      const insertHeader = models.buildInsertQuery(
        "penawaran",
        body_value_header
      );
      const hasil_insert_header = await models.transaksi(
        insertHeader.query,
        insertHeader.values
      );

      if (hasil_insert_header[0] === true) {
        const id_header = hasil_insert_header[1].insertId;

        // === Insert Detail Penawaran dan Barang ===
        for (const element of list_detail_penawaran) {
          // Detail Penawaran
          const body_value_detail = {
            id_penawaran: id_header,
            nama_barang: element.nama_barang,
            satuan: element.satuan,
            qty: element.qty,
            harga_satuan: element.harga_satuan,
            harga_total: element.harga_total,
          };
          const insertDetail = models.buildInsertQuery(
            "isi_penawaran",
            body_value_detail
          );
          await models.transaksi(insertDetail.query, insertDetail.values);

          // Barang
          const body_barang = {
            nama_barang: element.nama_barang,
            satuan: element.satuan,
            qty: element.qty,
            harga_satuan: element.harga_satuan,
            harga_total: element.harga_total,
          };
          const insertBarang = models.buildInsertQuery("barang", body_barang);
          await models.transaksi(insertBarang.query, insertBarang.values);
        }

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
    } catch (error) {
      console.error("Error simpanPenawaranHarga:", error.message);
      res.status(500).send({
        status: false,
        message: "Terjadi kesalahan pada server",
      });
    }
  },
};
