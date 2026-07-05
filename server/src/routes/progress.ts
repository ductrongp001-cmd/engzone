import { Router, Request, Response } from "express";
import { getDb, saveDb } from "../database";

const router = Router();

router.get("/:userId", async (req: Request, res: Response) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM user_progress WHERE user_id = ? ORDER BY last_studied DESC", [req.params.userId]);
  res.json(parseRows(result[0]));
});

router.post("/save", async (req: Request, res: Response) => {
  const db = await getDb();
  const { user_id, lesson_type, lesson_id, completed, score } = req.body;
  const existing = db.exec(
    "SELECT id FROM user_progress WHERE user_id = ? AND lesson_type = ? AND lesson_id = ?",
    [user_id, lesson_type, lesson_id]
  );
  if (existing.length > 0 && existing[0].values.length > 0) {
    db.run(
      "UPDATE user_progress SET completed = ?, score = ?, last_studied = datetime('now') WHERE user_id = ? AND lesson_type = ? AND lesson_id = ?",
      [completed, score, user_id, lesson_type, lesson_id]
    );
  } else {
    db.run(
      "INSERT INTO user_progress (user_id, lesson_type, lesson_id, completed, score) VALUES (?, ?, ?, ?, ?)",
      [user_id, lesson_type, lesson_id, completed, score]
    );
  }
  saveDb();
  res.json({ success: true });
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
