import { Router, Request, Response } from "express";
import { getDb, saveDb } from "../database";

const router = Router();

function parseRows(result: any) {
  if (!result || !result.columns) return [];
  return result.values.map((row: any[]) => {
    const obj: any = {};
    result.columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj;
  });
}

function adminOnly(req: Request, res: Response, next: Function) {
  const role = req.headers["x-user-role"];
  if (role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
}

router.use(adminOnly);

router.get("/stats", async (_req, res) => {
  const db = await getDb();
  const topics = parseRows(db.exec("SELECT COUNT(*) as count FROM vocabulary_topics")[0])[0]?.count || 0;
  const words = parseRows(db.exec("SELECT COUNT(*) as count FROM vocabulary_words")[0])[0]?.count || 0;
  const grammar = parseRows(db.exec("SELECT COUNT(*) as count FROM grammar_lessons")[0])[0]?.count || 0;
  const exercises = parseRows(db.exec("SELECT COUNT(*) as count FROM exercises")[0])[0]?.count || 0;
  const users = parseRows(db.exec("SELECT COUNT(*) as count FROM users")[0])[0]?.count || 0;
  res.json({ topics, words, grammar, exercises, users });
});

// Users
router.get("/users", async (_req, res) => {
  const db = await getDb();
  const result = db.exec("SELECT id, name, email, role, level, created_at FROM users ORDER BY id");
  res.json(parseRows(result[0] || { columns: [], values: [] }));
});

router.delete("/users/:id", async (req, res) => {
  const db = await getDb();
  db.run("DELETE FROM users WHERE id = ?", [parseInt(req.params.id)]);
  saveDb();
  res.json({ success: true });
});

// Vocabulary topics
router.get("/topics", async (_req, res) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM vocabulary_topics ORDER BY order_index");
  res.json(parseRows(result[0] || { columns: [], values: [] }));
});

router.post("/topics", async (req, res) => {
  const { name, description, level, icon, order_index } = req.body;
  const db = await getDb();
  db.run("INSERT INTO vocabulary_topics (name, description, level, icon, order_index) VALUES (?, ?, ?, ?, ?)",
    [name, description, level || "beginner", icon || "📁", order_index || 0]);
  saveDb();
  res.json({ success: true });
});

router.put("/topics/:id", async (req, res) => {
  const { name, description, level, icon, order_index } = req.body;
  const db = await getDb();
  db.run("UPDATE vocabulary_topics SET name=?, description=?, level=?, icon=?, order_index=? WHERE id=?",
    [name, description, level, icon, order_index, parseInt(req.params.id)]);
  saveDb();
  res.json({ success: true });
});

router.delete("/topics/:id", async (req, res) => {
  const db = await getDb();
  db.run("DELETE FROM vocabulary_words WHERE topic_id = ?", [parseInt(req.params.id)]);
  db.run("DELETE FROM vocabulary_topics WHERE id = ?", [parseInt(req.params.id)]);
  saveDb();
  res.json({ success: true });
});

// Grammar
router.get("/grammar", async (_req, res) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM grammar_lessons ORDER BY order_index");
  res.json(parseRows(result[0] || { columns: [], values: [] }));
});

router.post("/grammar", async (req, res) => {
  const { title, content, level, order_index } = req.body;
  const db = await getDb();
  db.run("INSERT INTO grammar_lessons (title, content, level, order_index) VALUES (?, ?, ?, ?)",
    [title, content, level || "beginner", order_index || 0]);
  saveDb();
  res.json({ success: true });
});

router.put("/grammar/:id", async (req, res) => {
  const { title, content, level, order_index } = req.body;
  const db = await getDb();
  db.run("UPDATE grammar_lessons SET title=?, content=?, level=?, order_index=? WHERE id=?",
    [title, content, level, order_index, parseInt(req.params.id)]);
  saveDb();
  res.json({ success: true });
});

router.delete("/grammar/:id", async (req, res) => {
  const db = await getDb();
  db.run("DELETE FROM grammar_examples WHERE lesson_id = ?", [parseInt(req.params.id)]);
  db.run("DELETE FROM grammar_lessons WHERE id = ?", [parseInt(req.params.id)]);
  saveDb();
  res.json({ success: true });
});

// Exercises
router.get("/exercises", async (_req, res) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM exercises ORDER BY id");
  res.json(parseRows(result[0] || { columns: [], values: [] }));
});

router.post("/exercises", async (req, res) => {
  const { type, question, options, correct_answer, explanation, difficulty } = req.body;
  const db = await getDb();
  db.run("INSERT INTO exercises (type, question, options, correct_answer, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?)",
    [type, question, JSON.stringify(options), correct_answer, explanation, difficulty || "beginner"]);
  saveDb();
  res.json({ success: true });
});

router.put("/exercises/:id", async (req, res) => {
  const { type, question, options, correct_answer, explanation, difficulty } = req.body;
  const db = await getDb();
  db.run("UPDATE exercises SET type=?, question=?, options=?, correct_answer=?, explanation=?, difficulty=? WHERE id=?",
    [type, question, JSON.stringify(options), correct_answer, explanation, difficulty, parseInt(req.params.id)]);
  saveDb();
  res.json({ success: true });
});

router.delete("/exercises/:id", async (req, res) => {
  const db = await getDb();
  db.run("DELETE FROM exercises WHERE id = ?", [parseInt(req.params.id)]);
  saveDb();
  res.json({ success: true });
});

export default router;
