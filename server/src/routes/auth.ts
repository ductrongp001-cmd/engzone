import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { getDb, saveDb } from "../database";
import { authenticate, AuthRequest } from "../middleware";

const JWT_SECRET = process.env.JWT_SECRET || "engzone_secret_key_change_in_prod";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/api/auth/google/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const router = Router();

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const db = await getDb();
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error("No email from Google"));
      const result = db.exec("SELECT * FROM users WHERE email = ?", [email]);
      let user: Record<string, any>;
      if (result[0]?.values?.length) {
        const cols = result[0].columns;
        const row = result[0].values[0];
        user = {};
        cols.forEach((col: string, i: number) => { user[col] = row[i]; });
      } else {
        const name = profile.displayName || email.split("@")[0];
        db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, "", "user"]);
        saveDb();
        const newResult = db.exec("SELECT * FROM users WHERE email = ?", [email]);
        if (newResult[0]?.values?.length) {
          const cols = newResult[0].columns;
          const row = newResult[0].values[0];
          user = {};
          cols.forEach((col: string, i: number) => { user[col] = row[i]; });
        } else {
          return done(new Error("Failed to create user"));
        }
      }
      done(null, user);
    } catch (err) {
      done(err as Error);
    }
  }));
}

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

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: FRONTEND_URL }),
  (req: any, res: Response) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(`${FRONTEND_URL}/auth?token=${token}`);
  }
);

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
