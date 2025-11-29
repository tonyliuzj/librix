import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'data.db'));
db.pragma('journal_mode = WAL');

db.prepare(`
  CREATE TABLE IF NOT EXISTS backends (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    url            TEXT    NOT NULL,
    authEnabled    INTEGER NOT NULL DEFAULT 0,
    username       TEXT,
    password       TEXT,
    rescanInterval INTEGER,
    scannedAt      TEXT
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS files (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    backendId   INTEGER NOT NULL,
    path        TEXT    NOT NULL,
    name        TEXT    NOT NULL,
    url         TEXT    NOT NULL,
    isDirectory INTEGER NOT NULL,
    size        INTEGER,
    modifiedAt  TEXT,
    scannedAt   TEXT    NOT NULL,
    UNIQUE(backendId, path),
    FOREIGN KEY (backendId) REFERENCES backends(id) ON DELETE CASCADE
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT    NOT NULL UNIQUE,
    password TEXT    NOT NULL
  );
`).run();

const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin') as { count: number };
if (adminExists.count === 0) {
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'changeme');
}

export default db;
