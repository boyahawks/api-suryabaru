const express = require("express");
const basicAuth = require("express-basic-auth");
const app = express();
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const os = require("os");

// Body parser config
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Static file
app.use(express.static("public"));

// CORS
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Basic auth
app.use(
  basicAuth({
    authorizer: (username, password) => {
      const userMatches = basicAuth.safeCompare(username, "sbanewapplication");
      const passwordMatches = basicAuth.safeCompare(
        password,
        "0a308bd81a825501a0b753eb1d4befff22d47ab8a50aa4b33dca1e3667e1d1ab",
      );
      return userMatches & passwordMatches;
    },
  }),
);

// Logging IP & headers
// app.use((req, res, next) => {
//   console.log("IP:", req.ip);
//   console.log("Headers:", req.headers);
//   next();
// });

// Routes
const appRoute = require("./src/routes/route");
app.use("/api/", appRoute);

// Get local network IP
// function getLocalIP() {
//   const interfaces = os.networkInterfaces();
//   for (const iface of Object.values(interfaces)) {
//     for (const alias of iface) {
//       if (alias.family === "IPv4" && !alias.internal) {
//         return alias.address;
//       }
//     }
//   }
//   return "localhost";
// }

const PORT = 3500;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  // const localIP = getLocalIP();
  console.log(`✅ Server running at:`);
  console.log(`👉 Localhost:   http://localhost:${PORT}`);
  // console.log(`👉 Local LAN:   http://${localIP}:${PORT}`);
});
