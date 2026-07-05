import { Router, Request, Response } from "express";
import { getDb } from "../database";

const router = Router();

router.get("/lessons", async (_req: Request, res: Response) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM grammar_lessons ORDER BY order_index");
  res.json(parseRows(result[0]));
});

router.get("/lessons/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const lessonResult = db.exec("SELECT * FROM grammar_lessons WHERE id = ?", [req.params.id]);
  if (lessonResult.length === 0 || lessonResult[0].values.length === 0) return res.status(404).json({ error: "Lesson not found" });
  const lesson = parseRows(lessonResult[0])[0];
  const examplesResult = db.exec("SELECT * FROM grammar_examples WHERE lesson_id = ?", [req.params.id]);
  lesson.examples = parseRows(examplesResult[0]);
  res.json(lesson);
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
