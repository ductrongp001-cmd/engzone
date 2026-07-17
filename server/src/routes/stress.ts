import { Router } from "express";
import { getDb } from "../database";

const router = Router();

function parseRows(result: any) {
  if (!result || !result.values) return [];
  return result.values.map((row: any[]) => {
    const obj: any = {};
    result.columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj;
  });
}

router.get("/rules", async (_req, res) => {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM stress_rules ORDER BY order_index");
    res.json(parseRows(result[0]));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stress rules" });
  }
});

router.get("/rules/:id", async (req, res) => {
  try {
    const db = await getDb();
    const ruleResult = db.exec("SELECT * FROM stress_rules WHERE id = ?", [req.params.id]);
    if (!ruleResult.length || !ruleResult[0].values.length) {
      return res.status(404).json({ error: "Rule not found" });
    }
    const rule = parseRows(ruleResult[0])[0];
    const examplesResult = db.exec("SELECT * FROM stress_examples WHERE rule_id = ?", [req.params.id]);
    rule.examples = parseRows(examplesResult[0]);
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stress rule" });
  }
});

export default router;
