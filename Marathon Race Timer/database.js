// database.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'race.db');
const db = new sqlite3.Database(dbPath);

// INSERT
export function insertResult(result) {
  return new Promise((resolve, reject) => {
    const { runnerId, name, time, timestamp } = result;
    db.run(
      `INSERT INTO results (runnerId, name, time, timestamp) VALUES (?, ?, ?, ?)`,
      [runnerId, name, time, timestamp],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

// GET ALL
export function getAllResults() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM results ORDER BY timestamp ASC`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
