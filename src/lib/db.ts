const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../../simple-pixel.db"));

db.exec(`
    CREATE TABLE IF NOT EXISTS pixels (
      id TEXT PRIMARY KEY,
      created_at INTEGER,
      expires_at INTEGER
    );
  `);

db.exec(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pixel_id TEXT,
        timestamp INTEGER,
        ip_hash TEXT,
        country TEXT,
        region TEXT,
        browser TEXT,
        os TEXT,
        device_type TEXT,
        params TEXT
    );
  `);

module.exports = db;
