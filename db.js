const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS EnvironmentalData (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      temperature REAL NOT NULL,
      humidity REAL NOT NULL,
      pm25 REAL NOT NULL,
      pm10 REAL NOT NULL,
      pm1 REAL NOT NULL,
      uv REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      sensorId TEXT NOT NULL
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS HealthData (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      heartRate REAL NOT NULL,
      oxygenLevel REAL NOT NULL,
      temperature REAL NOT NULL,
      sensorId TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'user',
      sensorId TEXT UNIQUE,
      firebaseUid TEXT NOT NULL UNIQUE
    )
  `);
});

module.exports = db;