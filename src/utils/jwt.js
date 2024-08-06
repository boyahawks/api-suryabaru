const jwt = require("jsonwebtoken");
const secretKey =
  "0a308bd81a825501a0b753eb1d4befff22d47ab8a50aa4b33dca1e3667e1d1ab";

function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: "7d" });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["token"];

  if (authHeader == null) {
    return res.send({
      status: false,
      message: 401,
    });
  }

  jwt.verify(authHeader, secretKey, (err, user) => {
    if (err) {
      return res.send({
        status: false,
        message: 403,
      });
    }
    // console.log(user);
    next();
  });
}

module.exports = { generateToken, authenticateToken };
