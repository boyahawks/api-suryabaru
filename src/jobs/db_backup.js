const cron = require("node-cron");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const BACKUP_DIR =
  process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
const TIMEZONE = process.env.BACKUP_TZ || "Asia/Jakarta";

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function getActiveDbConfig() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    throw new Error(
      "Konfigurasi database tidak lengkap (DB_HOST, DB_USER, DB_NAME wajib diisi)",
    );
  }

  return { host, user, password: password || "", database };
}

function formatDateStamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

/**
 * Hapus backup sebelumnya (kemarin / file lama) agar hanya tersisa 1 file per hari.
 */
function removePreviousBackups(database, todayFilename) {
  if (!fs.existsSync(BACKUP_DIR)) return;

  const files = fs.readdirSync(BACKUP_DIR);
  const prefix = `${database}_`;

  for (const file of files) {
    if (!file.startsWith(prefix) || !file.endsWith(".sql")) continue;
    // Jangan hapus file hari ini (jika sudah ada, akan diganti saat dump baru)
    if (file === todayFilename) continue;

    const fullPath = path.join(BACKUP_DIR, file);
    fs.unlinkSync(fullPath);
    console.log(`[DB Backup] File sebelumnya dihapus: ${file}`);
  }
}

function runMysqldump({ host, user, password, database }, outputPath) {
  return new Promise((resolve, reject) => {
    const cnfPath = path.join(
      os.tmpdir(),
      `mysqldump-${process.pid}-${Date.now()}.cnf`,
    );

    const cnfContent = [
      "[client]",
      `host=${host}`,
      `user=${user}`,
      `password=${password}`,
      "",
    ].join("\n");

    fs.writeFileSync(cnfPath, cnfContent, { mode: 0o600 });

    const outStream = fs.createWriteStream(outputPath);
    const dump = spawn(
      "mysqldump",
      [
        `--defaults-extra-file=${cnfPath}`,
        "--single-transaction",
        "--routines",
        "--triggers",
        "--events",
        database,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    let stderr = "";

    dump.stdout.pipe(outStream);
    dump.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    const cleanupCnf = () => {
      try {
        fs.unlinkSync(cnfPath);
      } catch (_) {
        // ignore
      }
    };

    dump.on("error", (err) => {
      cleanupCnf();
      outStream.destroy();
      reject(
        new Error(
          `Gagal menjalankan mysqldump. Pastikan mysql-client terinstall. ${err.message}`,
        ),
      );
    });

    dump.on("close", (code) => {
      cleanupCnf();
      outStream.end(() => {
        if (code === 0) {
          resolve();
          return;
        }

        try {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        } catch (_) {
          // ignore
        }

        reject(
          new Error(
            `mysqldump gagal (exit ${code})${stderr ? `: ${stderr.trim()}` : ""}`,
          ),
        );
      });
    });
  });
}

async function backupDatabase() {
  const startedAt = new Date();
  console.log(
    `[DB Backup] Mulai backup database aktif... (${startedAt.toISOString()})`,
  );

  try {
    ensureBackupDir();
    const db = getActiveDbConfig();
    const filename = `${db.database}_${formatDateStamp(startedAt)}.sql`;
    const outputPath = path.join(BACKUP_DIR, filename);

    // Hapus backup kemarin / file lama dulu, supaya hanya ada 1 file
    removePreviousBackups(db.database, filename);

    // Jika file hari ini sudah ada (re-run), ganti dengan backup baru
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
      console.log(`[DB Backup] File hari ini diganti: ${filename}`);
    }

    await runMysqldump(db, outputPath);

    const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(2);
    console.log(
      `[DB Backup] Berhasil: ${filename} (${sizeKb} KB) | DB: ${db.database}@${db.host}`,
    );
  } catch (err) {
    console.error(`[DB Backup] Gagal: ${err.message}`);
  }
}

function startDbBackupCron() {
  // Setiap hari jam 00:00 (timezone Asia/Jakarta)
  const schedule = process.env.BACKUP_CRON || "0 0 * * *";

  if (!cron.validate(schedule)) {
    console.error(`[DB Backup] Jadwal cron tidak valid: ${schedule}`);
    return;
  }

  cron.schedule(
    schedule,
    () => {
      backupDatabase();
    },
    { timezone: TIMEZONE },
  );

  console.log(
    `[DB Backup] Cron aktif: "${schedule}" (${TIMEZONE}) → folder ${BACKUP_DIR}`,
  );
}

module.exports = {
  startDbBackupCron,
  backupDatabase,
};
