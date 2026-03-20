const path = require('path');
const { app, ipcMain } = require('electron');
const { DatabaseSync } = require('node:sqlite');

let db;

function getDb() {
  if (db) return db;

  const dbPath = path.join(app.getPath('userData'), 'homeschool.sqlite');
  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

function initDb() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      avatar TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS letters_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      letter TEXT NOT NULL,
      clicks_count INTEGER DEFAULT 0,
      last_clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, letter)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS writing_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      letter TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'uppercase',
      word TEXT NOT NULL,
      emoji TEXT NOT NULL,
      color TEXT NOT NULL,
      instruction TEXT NOT NULL,
      audio_path TEXT NOT NULL,
      order_index INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS writing_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      task_id INTEGER NOT NULL,
      attempts_count INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, task_id)
    );

    CREATE TABLE IF NOT EXISTS match_letter_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level INTEGER NOT NULL,
      pairs TEXT NOT NULL,
      order_index INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS match_letter_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      round_id INTEGER NOT NULL,
      attempts_count INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, round_id)
    );

    CREATE TABLE IF NOT EXISTS match_word_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level INTEGER NOT NULL,
      pairs TEXT NOT NULL,
      order_index INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS match_word_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      round_id INTEGER NOT NULL,
      attempts_count INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, round_id)
    );
  `);

  const WRITING_TASKS = [
    { letter: 'A', word: 'Abelha', emoji: '🐝', color: '#F87171' },
    { letter: 'B', word: 'Bola', emoji: '⚽', color: '#60A5FA' },
    { letter: 'C', word: 'Casa', emoji: '🏠', color: '#34D399' },
    { letter: 'D', word: 'Dado', emoji: '🎲', color: '#FBBF24' },
    { letter: 'E', word: 'Elefante', emoji: '🐘', color: '#A78BFA' },
    { letter: 'F', word: 'Fogo', emoji: '🔥', color: '#F472B6' },
    { letter: 'G', word: 'Gato', emoji: '🐱', color: '#FB923C' },
    { letter: 'H', word: 'Hipopótamo', emoji: '🦛', color: '#2DD4BF' },
    { letter: 'I', word: 'Igreja', emoji: '⛪', color: '#818CF8' },
    { letter: 'J', word: 'Jacaré', emoji: '🐊', color: '#A3E635' },
    { letter: 'K', word: 'Kiwi', emoji: '🥝', color: '#4ADE80' },
    { letter: 'L', word: 'Leão', emoji: '🦁', color: '#FBBF24' },
    { letter: 'M', word: 'Macaco', emoji: '🐵', color: '#22D3EE' },
    { letter: 'N', word: 'Navio', emoji: '🚢', color: '#3B82F6' },
    { letter: 'O', word: 'Ovo', emoji: '🥚', color: '#FB923C' },
    { letter: 'P', word: 'Pato', emoji: '🦆', color: '#EAB308' },
    { letter: 'Q', word: 'Queijo', emoji: '🧀', color: '#FDE047' },
    { letter: 'R', word: 'Rato', emoji: '🐭', color: '#9CA3AF' },
    { letter: 'S', word: 'Sapo', emoji: '🐸', color: '#16A34A' },
    { letter: 'T', word: 'Trem', emoji: '🚂', color: '#EF4444' },
    { letter: 'U', word: 'Uva', emoji: '🍇', color: '#9333EA' },
    { letter: 'V', word: 'Vaca', emoji: '🐮', color: '#78716C' },
    { letter: 'W', word: 'Wafer', emoji: '🧇', color: '#D97706' },
    { letter: 'X', word: 'Xícara', emoji: '☕', color: '#FB7185' },
    { letter: 'Y', word: 'Yoga', emoji: '🧘', color: '#0D9488' },
    { letter: 'Z', word: 'Zebra', emoji: '🦓', color: '#71717A' }
  ];

  const { count } = database.prepare('SELECT COUNT(*) AS count FROM writing_tasks').get();
  if (count === 0) {
    const insertTask = database.prepare(
      'INSERT INTO writing_tasks (letter, level, word, emoji, color, instruction, audio_path, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    for (const [index, task] of WRITING_TASKS.entries()) {
      insertTask.run(
        task.letter,
        'uppercase',
        task.word,
        task.emoji,
        task.color,
        `Escreva a letra ${task.letter}`,
        `audio/${task.letter.toLowerCase()}.wav`,
        index + 1
      );
    }
  }

  const MATCH_ROUNDS = [
    { level: 1, pairs: JSON.stringify([['A','a'],['B','b'],['C','c']]), order_index: 1 },
    { level: 2, pairs: JSON.stringify([['D','d'],['E','e'],['F','f'],['G','g']]), order_index: 2 },
    { level: 3, pairs: JSON.stringify([['H','h'],['I','i'],['J','j'],['K','k'],['L','l']]), order_index: 3 },
    { level: 4, pairs: JSON.stringify([['M','m'],['N','n'],['Q','q'],['G','g'],['P','p'],['R','r']]), order_index: 4 },
  ];

  const { count: matchCount } = database.prepare('SELECT COUNT(*) AS count FROM match_letter_rounds').get();
  if (matchCount === 0) {
    const insertRound = database.prepare(
      'INSERT INTO match_letter_rounds (level, pairs, order_index) VALUES (?, ?, ?)'
    );
    for (const round of MATCH_ROUNDS) {
      insertRound.run(round.level, round.pairs, round.order_index);
    }
  }

  const MATCH_WORD_ROUNDS = [
    {
      level: 1,
      pairs: JSON.stringify([
        { word: 'GATO', animal: '🐱' },
        { word: 'BOI', animal: '🐂' },
        { word: 'PATO', animal: '🦆' },
      ]),
      order_index: 1,
    },
    {
      level: 2,
      pairs: JSON.stringify([
        { word: 'CACHORRO', animal: '🐶' },
        { word: 'GALO', animal: '🐓' },
        { word: 'VACA', animal: '🐮' },
        { word: 'PEIXE', animal: '🐟' },
      ]),
      order_index: 2,
    },
    {
      level: 3,
      pairs: JSON.stringify([
        { word: 'ELEFANTE', animal: '🐘' },
        { word: 'LEÃO', animal: '🦁' },
        { word: 'MACACO', animal: '🐵' },
        { word: 'COELHO', animal: '🐰' },
        { word: 'SAPO', animal: '🐸' },
      ]),
      order_index: 3,
    },
    {
      level: 4,
      pairs: JSON.stringify([
        { word: 'HIPOPÓTAMO', animal: '🦛' },
        { word: 'CANGURU', animal: '🦘' },
        { word: 'TARTARUGA', animal: '🐢' },
        { word: 'GIRAFA', animal: '🦒' },
        { word: 'GORILA', animal: '🦍' },
      ]),
      order_index: 4,
    },
  ];

  const { count: wordCount } = database.prepare('SELECT COUNT(*) AS count FROM match_word_rounds').get();
  if (wordCount === 0) {
    const insertWordRound = database.prepare(
      'INSERT INTO match_word_rounds (level, pairs, order_index) VALUES (?, ?, ?)'
    );
    for (const round of MATCH_WORD_ROUNDS) {
      insertWordRound.run(round.level, round.pairs, round.order_index);
    }
  }
}

function setupIpcHandlers() {
  const database = getDb();

  ipcMain.handle('db:getUsers', () => {
    return database.prepare('SELECT * FROM users').all();
  });

  ipcMain.handle('db:createUser', (_event, { name, age, avatar }) => {
    const result = database
      .prepare('INSERT INTO users (name, age, avatar) VALUES (?, ?, ?)')
      .run(name, age, avatar);

    return Number(result.lastInsertRowid);
  });

  ipcMain.handle('db:incrementClick', (_event, { userId, letter }) => {
    database.prepare(`
      INSERT INTO letters_progress (user_id, letter, clicks_count)
      VALUES (?, ?, 1)
      ON CONFLICT (user_id, letter)
      DO UPDATE SET
        clicks_count = letters_progress.clicks_count + 1,
        last_clicked_at = CURRENT_TIMESTAMP
    `).run(userId, letter);

    return true;
  });

  ipcMain.handle('db:getWritingTasks', () => {
    return database.prepare('SELECT * FROM writing_tasks ORDER BY order_index').all();
  });

  ipcMain.handle('db:getWritingProgress', (_event, { userId }) => {
    return database.prepare('SELECT * FROM writing_progress WHERE user_id = ?').all(userId);
  });

  ipcMain.handle('db:saveWritingProgress', (_event, { userId, taskId, completed }) => {
    database.prepare(`
      INSERT INTO writing_progress (user_id, task_id, attempts_count, completed, completed_at)
      VALUES (?, ?, 1, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)
      ON CONFLICT (user_id, task_id)
      DO UPDATE SET
        attempts_count = writing_progress.attempts_count + 1,
        completed = MAX(writing_progress.completed, excluded.completed),
        completed_at = CASE
          WHEN excluded.completed = 1 AND writing_progress.completed = 0 THEN CURRENT_TIMESTAMP
          ELSE writing_progress.completed_at
        END
    `).run(userId, taskId, completed ? 1 : 0, completed ? 1 : 0);

    return true;
  });

  ipcMain.handle('db:getMatchLetterRounds', () => {
    return database.prepare('SELECT * FROM match_letter_rounds ORDER BY order_index').all();
  });

  ipcMain.handle('db:getMatchLetterProgress', (_event, { userId }) => {
    return database.prepare('SELECT * FROM match_letter_progress WHERE user_id = ?').all(userId);
  });

  ipcMain.handle('db:saveMatchLetterProgress', (_event, { userId, roundId, completed }) => {
    database.prepare(`
      INSERT INTO match_letter_progress (user_id, round_id, attempts_count, completed, completed_at)
      VALUES (?, ?, 1, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)
      ON CONFLICT (user_id, round_id)
      DO UPDATE SET
        attempts_count = match_letter_progress.attempts_count + 1,
        completed = MAX(match_letter_progress.completed, excluded.completed),
        completed_at = CASE
          WHEN excluded.completed = 1 AND match_letter_progress.completed = 0 THEN CURRENT_TIMESTAMP
          ELSE match_letter_progress.completed_at
        END
    `).run(userId, roundId, completed ? 1 : 0, completed ? 1 : 0);
    return true;
  });

  ipcMain.handle('db:getMatchWordRounds', () => {
    return database.prepare('SELECT * FROM match_word_rounds ORDER BY order_index').all();
  });

  ipcMain.handle('db:getMatchWordProgress', (_event, { userId }) => {
    return database.prepare('SELECT * FROM match_word_progress WHERE user_id = ?').all(userId);
  });

  ipcMain.handle('db:saveMatchWordProgress', (_event, { userId, roundId, completed }) => {
    database.prepare(`
      INSERT INTO match_word_progress (user_id, round_id, attempts_count, completed, completed_at)
      VALUES (?, ?, 1, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)
      ON CONFLICT (user_id, round_id)
      DO UPDATE SET
        attempts_count = match_word_progress.attempts_count + 1,
        completed = MAX(match_word_progress.completed, excluded.completed),
        completed_at = CASE
          WHEN excluded.completed = 1 AND match_word_progress.completed = 0 THEN CURRENT_TIMESTAMP
          ELSE match_word_progress.completed_at
        END
    `).run(userId, roundId, completed ? 1 : 0, completed ? 1 : 0);
    return true;
  });
}

module.exports = { initDb, setupIpcHandlers };
