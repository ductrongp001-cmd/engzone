import { getDb } from "./database";

export async function initSchema() {
  const db = await getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      level TEXT DEFAULT 'beginner',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vocabulary_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      level TEXT NOT NULL,
      icon TEXT,
      order_index INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vocabulary_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      word TEXT NOT NULL,
      meaning TEXT NOT NULL,
      phonetic TEXT,
      example TEXT,
      audio_url TEXT,
      image_url TEXT,
      part_of_speech TEXT,
      FOREIGN KEY (topic_id) REFERENCES vocabulary_topics(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS grammar_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      level TEXT NOT NULL,
      category TEXT,
      order_index INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS grammar_examples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      sentence TEXT NOT NULL,
      translation TEXT,
      explanation TEXT,
      FOREIGN KEY (lesson_id) REFERENCES grammar_lessons(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_type TEXT NOT NULL,
      lesson_id INTEGER,
      question TEXT NOT NULL,
      options TEXT,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      difficulty TEXT DEFAULT 'beginner'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_type TEXT NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      score REAL DEFAULT 0,
      last_studied TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_vocabulary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      familiarity INTEGER DEFAULT 0,
      next_review TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (word_id) REFERENCES vocabulary_words(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS irregular_verbs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      base_form TEXT NOT NULL,
      past_simple TEXT NOT NULL,
      past_participle TEXT NOT NULL,
      meaning TEXT NOT NULL,
      example TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS api_cache (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS stress_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      rule TEXT NOT NULL,
      level TEXT DEFAULT 'intermediate',
      order_index INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS stress_examples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_id INTEGER NOT NULL,
      word TEXT NOT NULL,
      phonetic TEXT,
      stressed_part TEXT,
      explanation TEXT,
      FOREIGN KEY (rule_id) REFERENCES stress_rules(id)
    )
  `);
}
