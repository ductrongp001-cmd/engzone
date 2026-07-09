import { Router, Request, Response } from "express";
import { getDb } from "../database";

const router = Router();

function parseRows(result: any) {
  if (!result || !result.columns) return [];
  return result.values.map((row: any[]) => {
    const obj: any = {};
    result.columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj;
  });
}

router.get("/list", async (_req: Request, res: Response) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM irregular_verbs ORDER BY base_form");
  res.json(parseRows(result[0]));
});

router.get("/search", async (req: Request, res: Response) => {
  const q = (req.query.q as string || "").toLowerCase();
  const db = await getDb();
  const result = db.exec(
    "SELECT * FROM irregular_verbs WHERE LOWER(base_form) LIKE ? OR LOWER(meaning) LIKE ? ORDER BY base_form LIMIT 50",
    [`%${q}%`, `%${q}%`]
  );
  res.json(parseRows(result[0]));
});

router.get("/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM irregular_verbs WHERE id = ?", [req.params.id]);
  if (result.length === 0 || result[0].values.length === 0) return res.status(404).json({ error: "Verb not found" });
  res.json(parseRows(result[0])[0]);
});

export default router;
