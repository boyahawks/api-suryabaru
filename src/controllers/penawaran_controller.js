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
        body_value_header,
      );
      const hasil_insert_header = await models.transaksi(
        insertHeader.query,
        insertHeader.values,
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
            body_value_detail,
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

  /**
   * Edit penawaran seperti tambah data:
   * - update header
   * - sync detail (hapus lama, insert ulang dari payload)
   *
   * Body sama dengan POST /penawaran, plus id_penawaran di header:
   * {
   *   header_penawaran: [{ id_penawaran, kepada_nama, kepada_pt, proyek, tanggal_penawaran }],
   *   detail_penawaran: [{ nama_barang, satuan, qty, harga_satuan, harga_total }, ...]
   * }
   */
  async editPenawaranHarga(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    const list_header_penawaran = req.body.header_penawaran;
    const list_detail_penawaran = req.body.detail_penawaran;

    try {
      if (
        !Array.isArray(list_header_penawaran) ||
        list_header_penawaran.length === 0
      ) {
        return res.status(400).send({
          status: false,
          message: "header_penawaran wajib diisi",
        });
      }

      if (!Array.isArray(list_detail_penawaran)) {
        return res.status(400).send({
          status: false,
          message: "detail_penawaran wajib berupa array",
        });
      }

      const header = list_header_penawaran[0];
      const id_penawaran = header.id_penawaran;

      if (!id_penawaran) {
        return res.status(400).send({
          status: false,
          message: "id_penawaran wajib diisi di header_penawaran",
        });
      }

      await models.withTransaction(async (connection) => {
        // Pastikan header ada
        const [existing] = await connection.execute(
          "SELECT id_penawaran FROM penawaran WHERE id_penawaran = ?",
          [id_penawaran],
        );
        if (!existing.length) {
          const err = new Error("Data penawaran tidak ditemukan");
          err.statusCode = 404;
          throw err;
        }

        // Update header
        const body_value_header = {
          kepada_nama: header.kepada_nama,
          kepada_pt: header.kepada_pt,
          proyek: header.proyek,
          tanggal_penawaran: header.tanggal_penawaran,
        };
        const updateHeader = models.buildUpdateQuery(
          "penawaran",
          body_value_header,
          "id_penawaran",
          id_penawaran,
        );
        await connection.execute(updateHeader.query, updateHeader.values);

        // Sync detail: hapus semua detail lama, lalu insert ulang
        await connection.execute(
          "DELETE FROM isi_penawaran WHERE id_penawaran = ?",
          [id_penawaran],
        );

        for (const element of list_detail_penawaran) {
          const body_value_detail = {
            id_penawaran,
            nama_barang: element.nama_barang,
            satuan: element.satuan,
            qty: element.qty,
            harga_satuan: element.harga_satuan,
            harga_total: element.harga_total,
          };
          const insertDetail = models.buildInsertQuery(
            "isi_penawaran",
            body_value_detail,
          );
          await connection.execute(insertDetail.query, insertDetail.values);
        }
      });

      res.send({
        status: true,
        message: "Berhasil update data penawaran!",
      });
    } catch (error) {
      console.error("Error editPenawaranHarga:", error.message);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).send({
        status: false,
        message:
          statusCode === 404
            ? error.message
            : "Terjadi kesalahan pada server",
      });
    }
  },

  /**
   * Hapus header penawaran + semua detail isi_penawaran-nya.
   * Body: { "id_penawaran": 160 }
   */
  async hapusPenawaranHarga(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    try {
      const id_penawaran =
        req.body.id_penawaran ||
        req.body.cari1 ||
        req.body.cari ||
        req.query.id_penawaran;

      if (!id_penawaran) {
        return res.status(400).send({
          status: false,
          message: "id_penawaran wajib diisi",
        });
      }

      await models.withTransaction(async (connection) => {
        const [existing] = await connection.execute(
          "SELECT id_penawaran FROM penawaran WHERE id_penawaran = ?",
          [id_penawaran],
        );
        if (!existing.length) {
          const err = new Error("Data penawaran tidak ditemukan");
          err.statusCode = 404;
          throw err;
        }

        await connection.execute(
          "DELETE FROM isi_penawaran WHERE id_penawaran = ?",
          [id_penawaran],
        );
        await connection.execute(
          "DELETE FROM penawaran WHERE id_penawaran = ?",
          [id_penawaran],
        );
      });

      res.send({
        status: true,
        message: "Berhasil hapus data penawaran beserta detailnya!",
      });
    } catch (error) {
      console.error("Error hapusPenawaranHarga:", error.message);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).send({
        status: false,
        message:
          statusCode === 404
            ? error.message
            : "Terjadi kesalahan pada server",
      });
    }
  },
};
