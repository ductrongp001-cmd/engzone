import express from "express";
import cors from "cors";
import path from "path";
import { getDb, saveDb, getCached, setCache } from "./database";
import { initSchema } from "./schema";
import authRoutes from "./routes/auth";
import vocabularyRoutes from "./routes/vocabulary";
import grammarRoutes from "./routes/grammar";
import exercisesRoutes from "./routes/exercises";
import progressRoutes from "./routes/progress";
import adminRoutes from "./routes/admin";
 
const app = express();
const PORT = parseInt(process.env.PORT || "3001");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/grammar", grammarRoutes);
app.use("/api/exercises", exercisesRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/translate/:word", async (req, res) => {
  const word = req.params.word.trim().toLowerCase();
  if (!word) return res.status(400).json({ error: "Word is required" });

  try {
    const db = await getDb();
    // 1. Check local vocabulary DB first
    const local = db.exec("SELECT word, meaning, phonetic FROM vocabulary_words WHERE LOWER(word) = ?", [word]);
    if (local.length > 0 && local[0].values.length > 0) {
      const row = local[0];
      const data = row.values.map((v: any[]) => {
        const obj: any = {};
        row.columns.forEach((col: string, i: number) => { obj[col] = v[i]; });
        return obj;
      });
      return res.json({ source: "local", word, translations: data.map((d: any) => d.meaning), phonetic: data[0].phonetic });
    }

    // 2. Check cache
    const cached = await getCached<{ translations: string[] }>(`translate:${word}`);
    if (cached) {
      return res.json({ source: "cache", word, translations: cached.translations, phonetic: null });
    }

    // 3. Falls back to MyMemory API
    const apiRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`);
    const apiData: any = await apiRes.json();

    if (apiData.responseStatus === 200 && apiData.responseData?.translatedText) {
      let translation = apiData.responseData.translatedText;
      if (translation.toLowerCase() === word) {
        return res.json({ source: "none", word, translations: [], message: "Không tìm thấy bản dịch" });
      }
      // Cache result
      await setCache(`translate:${word}`, { translations: [translation] });
      return res.json({ source: "mymemory", word, translations: [translation], phonetic: null });
    }

    res.json({ source: "none", word, translations: [], message: "Không tìm thấy bản dịch" });
  } catch (err) {
    // Try cache on error
    const cached = await getCached<{ translations: string[] }>(`translate:${word}`);
    if (cached) {
      return res.json({ source: "cache", word, translations: cached.translations, phonetic: null });
    }
    res.json({ source: "none", word, translations: [], message: "Không thể kết nối dịch vụ dịch thuật" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve built frontend in production
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

async function start() {
  await initSchema();
  // Auto-seed if database is empty
  const db = await getDb();
  const users = db.exec("SELECT COUNT(*) as c FROM users");
  if (!users[0]?.values[0]?.[0]) {
    const { runSeed } = await import("./seed");
    await runSeed();
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EngZone running on http://localhost:${PORT} (LAN: http://192.168.1.x:${PORT})`);
  });
}

start();
