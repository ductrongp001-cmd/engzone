import { Router, Request, Response } from "express";
import { getDb } from "../database";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const db = await getDb();
  const { lesson_type, difficulty, lesson_id } = req.query;
  let query = "SELECT * FROM exercises WHERE 1=1";
  const params: any[] = [];
  if (lesson_type) { query += " AND lesson_type = ?"; params.push(lesson_type); }
  if (difficulty) { query += " AND difficulty = ?"; params.push(difficulty); }
  if (lesson_id) { query += " AND lesson_id = ?"; params.push(lesson_id); }
  query += " ORDER BY id";
  const result = db.exec(query, params);
  const exercises = parseRows(result[0]);
  const sanitized = exercises.map((ex: any) => ({
    ...ex,
    options: ex.options ? JSON.parse(ex.options) : null,
  }));
  res.json(sanitized);
});

router.post("/check", async (req: Request, res: Response) => {
  const db = await getDb();
  const { exercise_id, answer } = req.body;
  const result = db.exec("SELECT * FROM exercises WHERE id = ?", [exercise_id]);
  if (result.length === 0 || result[0].values.length === 0) return res.status(404).json({ error: "Exercise not found" });
  const ex = parseRows(result[0])[0];
  const correct = ex.correct_answer.trim().toLowerCase() === String(answer).trim().toLowerCase();
  res.json({ correct, correct_answer: ex.correct_answer, explanation: ex.explanation });
});

function parseRows(result: any) {
  if (!result || !result.columns) return [];
  return result.values.map((row: any[]) => {
    const obj: any = {};
    result.columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj;
  });
}

export default router;
