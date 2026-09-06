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
        body_value_header,
      );
      const hasil_insert_header = await models.transaksi(
        insertHeader.query,
        insertHeader.values,
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
            body_value_detail,
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
          data_kwitansi,
        );
        const hasil_insert_kwitansi = await models.transaksi(
          insertKwitansi.query,
          insertKwitansi.values,
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

  /**
   * Edit invoice seperti tambah data:
   * - update header
   * - sync detail (hapus lama, insert ulang)
   * - update / insert kwitansi
   *
   * Body sama dengan POST /invoice, plus id_invoice di header:
   * {
   *   header_invoice: [{ id_invoice, nomor_invoice, kepada_pt, ... }],
   *   detail_invoice: [{ nama_barang, satuan, qty, harga_satuan, harga_total }, ...],
   *   terbilang: "...",
   *   total_invoice: "..."
   * }
   */
  async editInvoice(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    const list_header_invoice = req.body.header_invoice;
    const list_detail_invoice = req.body.detail_invoice;
    const terbilang = req.body.terbilang;
    const total_invoice = req.body.total_invoice;

    try {
      if (
        !Array.isArray(list_header_invoice) ||
        list_header_invoice.length === 0
      ) {
        return res.status(400).send({
          status: false,
          message: "header_invoice wajib diisi",
        });
      }

      if (!Array.isArray(list_detail_invoice)) {
        return res.status(400).send({
          status: false,
          message: "detail_invoice wajib berupa array",
        });
      }

      const header = list_header_invoice[0];
      const id_invoice = header.id_invoice;

      if (!id_invoice) {
        return res.status(400).send({
          status: false,
          message: "id_invoice wajib diisi di header_invoice",
        });
      }

      await models.withTransaction(async (connection) => {
        const [existing] = await connection.execute(
          "SELECT id_invoice FROM invoice WHERE id_invoice = ?",
          [id_invoice],
        );
        if (!existing.length) {
          const err = new Error("Data invoice tidak ditemukan");
          err.statusCode = 404;
          throw err;
        }

        const body_value_header = {
          nomor_invoice: header.nomor_invoice,
          kepada_pt: header.kepada_pt,
          nama_proyek: header.nama_proyek,
          alamat_proyek: header.alamat_proyek,
          nomor_surat_jalan: header.nomor_surat_jalan,
          persen_diskon: header.persen_diskon,
          total_diskon: header.total_diskon,
          total_rounded: header.total_rounded,
          tanggal_invoice: header.tanggal_invoice,
        };
        const updateHeader = models.buildUpdateQuery(
          "invoice",
          body_value_header,
          "id_invoice",
          id_invoice,
        );
        await connection.execute(updateHeader.query, updateHeader.values);

        // Sync detail
        await connection.execute(
          "DELETE FROM isi_invoice WHERE id_invoice = ?",
          [id_invoice],
        );

        for (const element of list_detail_invoice) {
          const body_value_detail = {
            id_invoice,
            nama_barang: element.nama_barang,
            satuan: element.satuan,
            qty: element.qty,
            harga_satuan: element.harga_satuan,
            harga_total: element.harga_total,
          };
          const insertDetail = models.buildInsertQuery(
            "isi_invoice",
            body_value_detail,
          );
          await connection.execute(insertDetail.query, insertDetail.values);
        }

        // Sync kwitansi (update jika ada, insert jika belum)
        const [kwitansiRows] = await connection.execute(
          "SELECT id_kwitansi FROM kwitansi WHERE id_invoice = ?",
          [id_invoice],
        );

        if (kwitansiRows.length) {
          await connection.execute(
            "UPDATE kwitansi SET terbilang = ?, total = ? WHERE id_invoice = ?",
            [terbilang, total_invoice, id_invoice],
          );
        } else {
          const insertKwitansi = models.buildInsertQuery("kwitansi", {
            id_invoice,
            terbilang,
            total: total_invoice,
          });
          await connection.execute(
            insertKwitansi.query,
            insertKwitansi.values,
          );
        }
      });

      res.send({
        status: true,
        message: "Berhasil update data invoice!",
      });
    } catch (error) {
      console.error("Error editInvoice:", error.message);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).send({
        status: false,
        message:
          statusCode === 404 ? error.message : "Terjadi kesalahan pada server",
      });
    }
  },

  /**
   * Hapus invoice + isi_invoice + kwitansi.
   * Body: { "id_invoice": 160 }
   */
  async hapusInvoice(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    try {
      const id_invoice =
        req.body.id_invoice ||
        req.body.cari1 ||
        req.body.cari ||
        req.query.id_invoice;

      if (!id_invoice) {
        return res.status(400).send({
          status: false,
          message: "id_invoice wajib diisi",
        });
      }

      await models.withTransaction(async (connection) => {
        const [existing] = await connection.execute(
          "SELECT id_invoice FROM invoice WHERE id_invoice = ?",
          [id_invoice],
        );
        if (!existing.length) {
          const err = new Error("Data invoice tidak ditemukan");
          err.statusCode = 404;
          throw err;
        }

        await connection.execute(
          "DELETE FROM isi_invoice WHERE id_invoice = ?",
          [id_invoice],
        );
        await connection.execute(
          "DELETE FROM kwitansi WHERE id_invoice = ?",
          [id_invoice],
        );
        await connection.execute("DELETE FROM invoice WHERE id_invoice = ?", [
          id_invoice,
        ]);
      });

      res.send({
        status: true,
        message: "Berhasil hapus data invoice beserta detail dan kwitansi!",
      });
    } catch (error) {
      console.error("Error hapusInvoice:", error.message);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).send({
        status: false,
        message:
          statusCode === 404 ? error.message : "Terjadi kesalahan pada server",
      });
    }
  },
};
