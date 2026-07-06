import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb, saveDb } from "../database";

const JWT_SECRET = process.env.JWT_SECRET || "engzone_secret_key_change_in_prod";
const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const db = await getDb();
  try {
    const hashed = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashed]);
    saveDb();
    res.json({ success: true, message: "User created" });
  } catch {
    res.status(400).json({ error: "Email already exists" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = await getDb();
  const result = db.exec("SELECT * FROM users WHERE email = ?", [email]);
  if (!result.length || !result[0].values.length) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const cols = result[0].columns;
  const row = result[0].values[0];
  const userData: Record<string, any> = {};
  cols.forEach((col: string, i: number) => { userData[col] = row[i]; });
  const valid = await bcrypt.compare(password, userData.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign(
    { id: userData.id, email: userData.email, role: userData.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({
    success: true,
    token,
    user: { id: userData.id, name: userData.name, email: userData.email, role: userData.role, level: userData.level }
  });
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
