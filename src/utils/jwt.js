const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

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
