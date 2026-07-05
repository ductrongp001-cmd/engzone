import { useState } from "react";
import { api } from "../api";

interface DictionaryResult {
  word: string;
  phonetic: string;
  phonetics: { text: string; audio: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example: string; synonyms: string[]; antonyms: string[] }[];
    synonyms: string[];
    antonyms: string[];
  }[];
  sourceUrls: string[];
}

interface TranslateResult {
  source: "local" | "mymemory" | "cache" | "none";
  word: string;
  translations: string[];
  phonetic: string | null;
  message?: string;
}



export default function Dictionary() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [translation, setTranslation] = useState<TranslateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setTranslation(null);

    const searchWord = word.trim().toLowerCase();

    // Dịch Anh -> Việt (qua backend + cache)
    try {
      const t = await api.get<TranslateResult>(`/translate/${encodeURIComponent(searchWord)}`);
      setTranslation(t);
    } catch {
      setTranslation({ source: "none", word: searchWord, translations: [], phonetic: null, message: "Không thể tra cứu" });
    }

    // Tra từ điển Anh-Anh
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(searchWord)}`);
      if (!res.ok) throw new Error("not_found");
      const data: DictionaryResult[] = await res.json();
      setResult(data[0]);
    } catch {
      // Silent fail - vẫn hiển thị nghĩa Việt nếu có
    }

    setLoading(false);
  };

  const playAudio = (url: string) => {
    if (!url) return;
    new Audio(url).play().catch(() => {});
  };

  const hasData = result || (translation && translation.translations.length > 0);

  return (
    <div className="page">
      <h1>Tra từ điển</h1>
      <p className="hero-sub">Tra cứu bất kỳ từ tiếng Anh nào - nghĩa tiếng Việt, phát âm, ví dụ</p>

      <div className="dict-search-box">
        <input
          className="dict-input"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Nhập từ tiếng Anh..."
        />
        <button className="dict-btn" onClick={search} disabled={loading}>
          {loading ? "Đang tra..." : "Tra cứu"}
        </button>
      </div>

      {!hasData && !error && !loading && (
        <div className="dict-empty">
          <p>Nhập một từ tiếng Anh để tra nghĩa tiếng Việt và định nghĩa.</p>
        </div>
      )}

      {hasData && (
        <div className="dict-result">
          {/* Nghĩa tiếng Việt */}
          {translation && translation.translations.length > 0 && (
            <div className="dict-vn-section">
              <h3 className="dict-vn-label">🇻🇳 Nghĩa tiếng Việt</h3>
              <div className="dict-vn-item">
                <strong className="dict-word-lg">{translation.word}</strong>
                {translation.phonetic && <span className="dict-phonetic">{translation.phonetic}</span>}
                {translation.translations.map((t, i) => (
                  <p key={i} className="dict-vn-meaning">{t}</p>
                ))}
                <span className={`dict-badge dict-badge-${translation.source}`}>
                  {translation.source === "local" ? "📖 Từ trong bài học" :
                   translation.source === "cache" ? "💾 Cache" : "🌐 Dịch thuật"}
                </span>
              </div>
            </div>
          )}

          {translation && translation.translations.length === 0 && (
            <div className="dict-vn-section" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
              <p style={{ color: "#dc2626" }}>⚠️ {translation.message || "Không tìm thấy bản dịch"}</p>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.3rem" }}>
                Thử kiểm tra lại chính tả hoặc dùng từ khác.
              </p>
            </div>
          )}

          {/* Từ điển Anh-Anh */}
          {result && (
            <>
              <div className="dict-header">
                <h2>{result.word}</h2>
                {result.phonetic && <span className="dict-phonetic">{result.phonetic}</span>}
                {result.phonetics.map((p, i) =>
                  p.audio ? (
                    <button key={i} className="dict-audio-btn" onClick={() => playAudio(p.audio)}>
                      🔊 Phát âm
                    </button>
                  ) : null
                )}
              </div>

              {result.meanings.map((meaning, mi) => (
                <div key={mi} className="dict-meaning-section">
                  <h3 className="dict-pos">{meaning.partOfSpeech}</h3>

                  {meaning.definitions.map((def, di) => (
                    <div key={di} className="dict-definition">
                      <p className="dict-def-text">{di + 1}. {def.definition}</p>
                      {def.example && <p className="dict-example">📝 <em>{def.example}</em></p>}
                      {def.synonyms.length > 0 && (
                        <p className="dict-synonyms">🔗 Đồng nghĩa: {def.synonyms.slice(0, 5).join(", ")}</p>
                      )}
                      {def.antonyms.length > 0 && (
                        <p className="dict-antonyms">✖ Trái nghĩa: {def.antonyms.slice(0, 5).join(", ")}</p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
