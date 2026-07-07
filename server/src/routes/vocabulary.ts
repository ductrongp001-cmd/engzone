import { Router, Request, Response } from "express";
import { getDb } from "../database";

const router = Router();

router.get("/topics", async (_req: Request, res: Response) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM vocabulary_topics ORDER BY order_index");
  res.json(parseRows(result[0]));
});

router.get("/topics/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM vocabulary_topics WHERE id = ?", [req.params.id]);
  if (result.length === 0 || result[0].values.length === 0) return res.status(404).json({ error: "Topic not found" });
  res.json(parseRows(result[0])[0]);
});

router.get("/topics/:id/words", async (req: Request, res: Response) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM vocabulary_words WHERE topic_id = ? ORDER BY id", [req.params.id]);
  res.json(parseRows(result[0]));
});

router.get("/words/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM vocabulary_words WHERE id = ?", [req.params.id]);
  if (result.length === 0 || result[0].values.length === 0) return res.status(404).json({ error: "Word not found" });
  res.json(parseRows(result[0])[0]);
});

router.get("/words", async (req: Request, res: Response) => {
  const topicIds = (req.query.topicIds as string) || "";
  const limit = parseInt(req.query.limit as string) || 0;
  const db = await getDb();
  let sql = "SELECT * FROM vocabulary_words";
  const params: any[] = [];
  if (topicIds) {
    const ids = topicIds.split(",").map(Number).filter(Boolean);
    if (ids.length > 0) {
      sql += " WHERE topic_id IN (" + ids.map(() => "?").join(",") + ")";
      params.push(...ids);
    }
  }
  sql += " ORDER BY RANDOM()";
  if (limit > 0) sql += " LIMIT ?";
  if (limit > 0) params.push(limit);
  const result = db.exec(sql, params);
  res.json(parseRows(result[0]));
});

router.get("/search", async (req: Request, res: Response) => {
  const q = (req.query.q as string || "").toLowerCase();
  const db = await getDb();
  const result = db.exec(
    "SELECT vw.id, vw.word, vw.meaning, vw.phonetic, vw.part_of_speech, vt.name as topic_name FROM vocabulary_words vw LEFT JOIN vocabulary_topics vt ON vw.topic_id = vt.id WHERE LOWER(vw.word) LIKE ? OR LOWER(vw.meaning) LIKE ? ORDER BY vw.word LIMIT 50",
    [`%${q}%`, `%${q}%`]
  );
  res.json(parseRows(result[0]));
});

router.get("/lookup/:word", async (req: Request, res: Response) => {
  const db = await getDb();
  const word = req.params.word.toLowerCase();
  const result = db.exec("SELECT word, meaning, phonetic FROM vocabulary_words WHERE LOWER(word) = ?", [word]);
  if (result.length === 0 || result[0].values.length === 0) {
    return res.json({ found: false });
  }
  res.json({ found: true, data: parseRows(result[0]) });
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
