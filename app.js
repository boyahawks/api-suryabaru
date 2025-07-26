const express = require("express");
const basicAuth = require("express-basic-auth");
const app = express();
const multer = require("multer");
const bodyParser = require("body-parser");
// const fileUpload = require("express-fileupload");
const cors = require("cors");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// untuk akses file static
app.use(express.static("public"));
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(
  basicAuth({
    authorizer: (username, password) => {
      const userMatches = basicAuth.safeCompare(username, "sbanewapplication");
      const passwordMatches = basicAuth.safeCompare(
        password,
        "0a308bd81a825501a0b753eb1d4befff22d47ab8a50aa4b33dca1e3667e1d1ab"
      );
      return userMatches & passwordMatches;
    },
  })
);

const appRoute = require("./src/routes/route");
app.use("/api/", appRoute);

const PORT = 3000; // or any other port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
