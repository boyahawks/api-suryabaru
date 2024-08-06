const bcrypt = require("bcrypt");

module.exports = {
  encrypt(text) {
    var hash = bcrypt.hash(text, 10);
    return hash;
  },
  decrypt(password, hashedPassword) {
    const login = password;
    const data = hashedPassword;
    const result = bcrypt.compareSync(login, data);
    return result;
  },
};
