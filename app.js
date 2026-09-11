require("dotenv").config();

const express = require("express");
const basicAuth = require("express-basic-auth");
const app = express();
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
      const userMatches = basicAuth.safeCompare(
        username,
        process.env.BASIC_AUTH_USER,
      );
      const passwordMatches = basicAuth.safeCompare(
        password,
        process.env.BASIC_AUTH_PASSWORD,
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

const PORT = process.env.PORT || 3500;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  // const localIP = getLocalIP();
  console.log(`✅ Server running at:`);
  console.log(`👉 Localhost:   http://localhost:${PORT}`);
  // console.log(`👉 Local LAN:   http://${localIP}:${PORT}`);

  // Cron backup database aktif setiap jam 00:00
  const { startDbBackupCron } = require("./src/jobs/db_backup");
  startDbBackupCron();
});
