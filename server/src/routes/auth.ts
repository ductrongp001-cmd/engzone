import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { getDb, saveDb } from "../database";
import { authenticate, AuthRequest } from "../middleware";

const JWT_SECRET = process.env.JWT_SECRET || "engzone_secret_key_change_in_prod";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const router = Router();
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

router.get("/verify", authenticate, async (req: AuthRequest, res: Response) => {
  const db = await getDb();
  const result = db.exec("SELECT id, name, email, role, level FROM users WHERE id = ?", [req.user!.id]);
  if (!result.length || !result[0].values.length) {
    return res.status(401).json({ error: "User not found" });
  }
  const cols = result[0].columns;
  const row = result[0].values[0];
  const user: Record<string, any> = {};
  cols.forEach((col: string, i: number) => { user[col] = row[i]; });
  res.json({ success: true, user });
});

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

router.post("/google", async (req: Request, res: Response) => {
  try {
    if (!googleClient) return res.status(400).json({ error: "Google auth not configured" });
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Missing credential" });
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ error: "Invalid token" });
    const db = await getDb();
    const result = db.exec("SELECT * FROM users WHERE email = ?", [payload.email]);
    let user: Record<string, any>;
    if (result[0]?.values?.length) {
      const cols = result[0].columns;
      const row = result[0].values[0];
      user = {};
      cols.forEach((col: string, i: number) => { user[col] = row[i]; });
    } else {
      const name = payload.name || payload.email.split("@")[0];
      db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, payload.email, "", "user"]);
      saveDb();
      const newResult = db.exec("SELECT * FROM users WHERE email = ?", [payload.email]);
      if (newResult[0]?.values?.length) {
        const cols = newResult[0].columns;
        const row = newResult[0].values[0];
        user = {};
        cols.forEach((col: string, i: number) => { user[col] = row[i]; });
      } else {
        return res.status(500).json({ error: "Failed to create user" });
      }
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, level: user.level }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Google auth failed" });
  }
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
