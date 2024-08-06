const router = require("express").Router();
const { globalCt, authCt, penawaranCt, invoiceCt } = require("../controllers");
const { generateToken, authenticateToken } = require("../utils/jwt");

// AUTH
router.post("/validasi_login", authCt.validasi_login);
router.post("/validasi_otp", authCt.login_aplikasi_token);

// USER
router.get("/users", authenticateToken, globalCt.allData);
router.get("/user/:nopeg", globalCt.allData);
router.patch("/users", globalCt.editData);

// PENAWARAN HARGA
router.get("/penawaran", authenticateToken, globalCt.allData);
router.get("/penawaran-detail/:id", authenticateToken, globalCt.allData);
router.patch("/penawaran", authenticateToken, globalCt.editData);
router.patch("/isi_penawaran", authenticateToken, globalCt.editData);
router.post("/penawaran", authenticateToken, penawaranCt.simpanPenawaranHarga);

// INVOICE
router.get("/invoice", authenticateToken, globalCt.allData);
router.get("/invoice-detail/:id", authenticateToken, globalCt.allData);
router.get("/kwitansi-detail/:id", authenticateToken, globalCt.allData);
router.patch("/invoice", authenticateToken, globalCt.editData);
router.delete("/invoice", authenticateToken, globalCt.deleteData);
router.patch("/kwitansi", authenticateToken, globalCt.editData);
router.delete("/kwitansi", authenticateToken, globalCt.deleteData);
router.patch("/isi_invoice", authenticateToken, globalCt.editData);
router.delete("/isi_invoice", authenticateToken, globalCt.deleteData);
router.post("/invoice", authenticateToken, invoiceCt.simpanInvoice);
router.post("/isi_invoice", authenticateToken, globalCt.insertData);

// GLOBAL MODUL
router.get("/validasiToken", authenticateToken, globalCt.validasiToken);

router.get("/client", authenticateToken, globalCt.allData);
router.post("/client", authenticateToken, globalCt.insertData);
router.delete("/client", authenticateToken, globalCt.deleteData);

router.get("/proyek", authenticateToken, globalCt.allData);
router.post("/proyek", authenticateToken, globalCt.insertData);
router.delete("/proyek", authenticateToken, globalCt.deleteData);

router.get("/logistik", authenticateToken, globalCt.allData);
router.post("/logistik", authenticateToken, globalCt.insertData);
router.delete("/logistik", authenticateToken, globalCt.deleteData);

router.get("/barang", authenticateToken, globalCt.allData);
router.get("/barang-part", authenticateToken, globalCt.allData);
router.post("/barang-cari", authenticateToken, globalCt.allData);

module.exports = router;
