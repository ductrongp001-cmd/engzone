import { Router, Request, Response } from "express";
import { getDb, saveDb } from "../database";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const db = await getDb();
  try {
    db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password]);
    saveDb();
    res.json({ success: true, message: "User created" });
  } catch (err: any) {
    res.status(400).json({ error: "Email already exists" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = await getDb();
  const user = db.exec("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
  if (user.length === 0 || user[0].values.length === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const row = user[0].values[0];
  const cols = user[0].columns;
  const userData: any = {};
  cols.forEach((col: string, i: number) => { userData[col] = row[i]; });
  res.json({ success: true, user: { id: userData.id, name: userData.name, email: userData.email, role: userData.role, level: userData.level } });
});

router.get("/users", async (_req: Request, res: Response) => {
  const db = await getDb();
  const result = db.exec("SELECT id, name, email, role, level, created_at FROM users");
  res.json(parseRows(result[0] || { columns: [], values: [] }));
});

function parseRows(result: any) {
  return (result.values || []).map((row: any[]) => {
    const obj: any = {};
    result.columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj;
  });
}

export default router;
