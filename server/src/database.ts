import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(__dirname, "..", "data", "english.db");

let db: SqlJsDatabase | null = null;
let initPromise: Promise<void> | null = null;

export async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;
  if (initPromise) {
    await initPromise;
    return db!;
  }
  initPromise = (async () => {
    const SQL = await initSqlJs();
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
    // Auto-save every 30 seconds
    setInterval(() => saveDb(), 30000);
  })();
  await initPromise;
  return db!;
}

export function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error("Auto-save error:", err);
  }
}

export async function getCached<T>(key: string): Promise<T | null> {
  const d = await getDb();
  const result = d.exec("SELECT data FROM api_cache WHERE key = ?", [key]);
  if (result.length > 0 && result[0].values.length > 0) {
    return JSON.parse(result[0].values[0][0] as string) as T;
  }
  return null;
}

export async function setCache(key: string, data: any) {
  const d = await getDb();
  d.run(
    "INSERT OR REPLACE INTO api_cache (key, data, cached_at) VALUES (?, ?, datetime('now'))",
    [key, JSON.stringify(data)]
  );
}
