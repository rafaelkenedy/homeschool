const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app, ipcMain } = require('electron');

let db;

function getDb() {
  if (db) return db;
  const dbPath = path.join(app.getPath('userData'), 'homeschool.sqlite');
  db = new sqlite3.Database(dbPath);
  return db;
}

function initDb() {
  const database = getDb();
  database.serialize(() => {
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        avatar TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    database.run(`
      CREATE TABLE IF NOT EXISTS letters_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        letter TEXT NOT NULL,
        clicks_count INTEGER DEFAULT 0,
        last_clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, letter)
      )
    `);

    database.run(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      )
    `);
  });
}

function setupIpcHandlers() {
  const database = getDb();
  
  ipcMain.handle('db:getUsers', () => {
    return new Promise((resolve, reject) => {
      database.all('SELECT * FROM users', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });

  ipcMain.handle('db:createUser', (event, { name, age, avatar }) => {
    return new Promise((resolve, reject) => {
      database.run('INSERT INTO users (name, age, avatar) VALUES (?, ?, ?)', [name, age, avatar], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  });

  ipcMain.handle('db:incrementClick', (event, { userId, letter }) => {
    return new Promise((resolve, reject) => {
      database.run(
        `INSERT INTO letters_progress (user_id, letter, clicks_count) 
         VALUES (?, ?, 1) 
         ON CONFLICT (user_id, letter) 
         DO UPDATE SET clicks_count = clicks_count + 1, last_clicked_at = CURRENT_TIMESTAMP`,
        [userId, letter],
        function(err) {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
  });
}

module.exports = { initDb, setupIpcHandlers };
