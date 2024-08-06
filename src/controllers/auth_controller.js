const { select_global, transaksi } = require("../utils/model");
const utils = require("../utils/utility");
const { generateToken, authenticateToken } = require("../utils/jwt");

module.exports = {
  async login_aplikasi_token(req, res) {
    var id_user = req.body.id_user;
    var token = req.body.token;
    var tanggalnow = req.body.tanggalnow;

    var check_where = `SELECT * FROM history_login WHERE id_user='${id_user}' AND token='${token}'`;
    var check_user = await select_global(check_where);
    if (check_user[0] == true && check_user[1].length != 0) {
      if (check_user[1][0].tanggal_login == null) {
        var update_data = {
          tanggal_login: tanggalnow,
        };
        // UPDATE TANGGAL LOGIN
        var query_update = `UPDATE history_login SET ? WHERE id_user='${id_user}' AND token='${token}'`;
        var hasil_update = await transaksi(query_update, update_data);
        if (hasil_update[0] == true) {
          // GENERATE TOKEN LOGIN
          const token = generateToken({ otp: req.body.token });
          res.send({
            status: true,
            message: "Token valid",
            token: token,
          });
        }
      } else {
        res.send({
          status: false,
          message: "Token sudah kadaluarsa",
        });
      }
    } else {
      res.send({
        status: false,
        message: "Token tidak valid",
      });
    }
  },

  async validasi_login(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    var nomor = req.body.nomor;
    var password = req.body.password;

    var query_check1 = `SELECT * FROM users WHERE no_wa='${nomor}';`;
    var check_user = await select_global(query_check1);
    if (check_user[0] == true && check_user[1].length != 0) {
      var status = utils.decrypt(password, check_user[1][0].password);
      if (status == true) {
        const token = generateToken({ nomor: req.body.nomor });
        res.send({
          status: true,
          message: "Berhasil ambil data!",
          password: status,
          data: check_user[1],
          token: token,
        });
      } else {
        res.send({
          status: false,
          message: "Password salah !",
        });
      }
    } else {
      res.send({
        status: false,
        message: "Pengguna tidak di temukan!",
      });
    }
  },
};
