import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../context/auth";
import { api } from "../api";
import SpeakButton from "../components/SpeakButton";
import type { Exercise, Word } from "../types";

function shuffle<T>(a: T[]) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const categories = [
  { id: "pronunciation", icon: "🔊", title: "Phát âm", desc: "Nghe và đọc theo từ vựng", color: "#0891b2" },
  { id: "spelling", icon: "✍️", title: "Viết chính tả", desc: "Nghe từ và gõ lại chính xác", color: "#059669" },
  { id: "gap-fill", icon: "🔤", title: "Điền từ vào câu", desc: "Đoán từ còn thiếu trong câu", color: "#d97706" },
  { id: "vocab-quiz", icon: "📝", title: "Trắc nghiệm từ vựng", desc: "Kiểm tra nghĩa của từ", color: "#4f46e5" },
  { id: "grammar-quiz", icon: "📖", title: "Trắc nghiệm ngữ pháp", desc: "Ôn tập cấu trúc ngữ pháp", color: "#7c3aed" },
  { id: "practice", icon: "✏️", title: "Thi luyện", desc: "Bài kiểm tra tổng hợp theo cấp độ", color: "#dc2626" },
];

const difficulties = [
  { value: "beginner", label: "Cơ bản", color: "#4f46e5" },
  { value: "intermediate", label: "Trung cấp", color: "#0891b2" },
  { value: "advanced", label: "Nâng cao", color: "#7c3aed" },
];

type View = { id: string; diff?: string } | null;

export default function Exercises() {
  const { user } = useAuth();
  const [view, setView] = useState<View>(null);

  const go = (id: string) => setView({ id });
  const back = () => setView(null);

  if (!view) return <Page><CategoryMenu onSelect={go} /></Page>;

  return (
    <Page>
      <button className="back-btn" onClick={back}>← Quay lại</button>
      {view.id === "pronunciation" && <PronunciationPractice />}
      {view.id === "spelling" && <SpellingPractice />}
      {view.id === "gap-fill" && <GapFill />}
      {view.id === "vocab-quiz" && <ExerciseQuiz lessonType="vocabulary" />}
      {view.id === "grammar-quiz" && <ExerciseQuiz lessonType="grammar" />}
      {view.id === "practice" && <PracticeTest user={user} />}
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <div className="page">{children}</div>;
}

/* ─── CATEGORY MENU ─── */
function CategoryMenu({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="topics-grid">
      {categories.map((c) => (
        <button key={c.id} className="topic-card" onClick={() => onSelect(c.id)}
          style={{ borderLeft: `4px solid ${c.color}` }}>
          <span className="topic-icon">{c.icon}</span>
          <div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── PRONUNCIATION ─── */
function PronunciationPractice() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const topics = await api.get<{ id: number }[]>("/vocabulary/topics");
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const data = await api.get<Word[]>(`/vocabulary/topics/${topic.id}/words`);
    setWords(shuffle(data).slice(0, 10));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div>
      <p className="page-desc">Nhấn 🔊 để nghe phát âm, đọc theo để luyện tập.</p>
      <div className="words-list">
        {words.map((w) => (
          <div key={w.id} className="word-card">
            <div className="word-header">
              <strong className="word-text">{w.word}</strong>
              <SpeakButton text={w.word} />
              <span className="phonetic">{w.phonetic}</span>
              <span className="pos">{w.part_of_speech}</span>
            </div>
            <p className="word-meaning">{w.meaning}</p>
            {w.example && <p className="word-example"><SpeakButton text={w.example} /><em>{w.example}</em></p>}
          </div>
        ))}
      </div>
      <button className="submit-btn" onClick={load}>Từ mới</button>
    </div>
  );
}

/* ─── SPELLING ─── */
function SpellingPractice() {
  const [words, setWords] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const topics = await api.get<{ id: number }[]>("/vocabulary/topics");
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const data = await api.get<Word[]>(`/vocabulary/topics/${topic.id}/words`);
    setWords(shuffle(data).slice(0, 10));
    setIndex(0); setInput(""); setResult(null); setDone(false); setCorrect(0);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const check = () => {
    const isCorrect = input.trim().toLowerCase() === words[index].word.toLowerCase();
    setResult(isCorrect);
    if (isCorrect) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (index >= words.length - 1) { setDone(true); return; }
    setIndex((i) => i + 1);
    setInput("");
    setResult(null);
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (done) return (
    <div className="score-section">
      <p>Kết quả: {correct}/{words.length} từ đúng</p>
      <button className="submit-btn" onClick={load} style={{ marginTop: "1rem" }}>Làm lại</button>
    </div>
  );

  const w = words[index];
  return (
    <div>
      <p className="page-desc">Nghe từ và gõ lại chính xác những gì bạn nghe được.</p>
      <p className="stress-counter">Từ {index + 1}/{words.length}</p>
      <div className="exercise-card" style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          <SpeakButton text={w.word} />
        </p>
        <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>{w.phonetic}</p>
        <input className="ex-input" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Gõ từ bạn nghe được..." disabled={result !== null}
          onKeyDown={(e) => e.key === "Enter" && !result && input.trim() && check()} />
        {result !== null && (
          <p className={`ex-result ${result ? "ex-correct" : "ex-wrong"}`}>
            {result ? "✓ Đúng!" : `✗ Sai. Đáp án: ${w.word} — ${w.meaning}`}
          </p>
        )}
      </div>
      {!result && <button className="submit-btn" disabled={!input.trim()} onClick={check}>Kiểm tra</button>}
      {result !== null && <button className="submit-btn" onClick={next}>{index < words.length - 1 ? "Tiếp theo" : "Xem kết quả"}</button>}
    </div>
  );
}

/* ─── GAP FILL ─── */
function GapFill() {
  const [words, setWords] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const topics = await api.get<{ id: number }[]>("/vocabulary/topics");
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const data = await api.get<Word[]>(`/vocabulary/topics/${topic.id}/words`);
    const withExamples = data.filter((w) => w.example);
    setWords(shuffle(withExamples).slice(0, 10));
    setIndex(0); setInput(""); setResult(null); setDone(false); setCorrect(0);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const maskWord = (sentence: string, word: string) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    return sentence.replace(regex, "______");
  };

  const check = () => {
    const isCorrect = input.trim().toLowerCase() === words[index].word.toLowerCase();
    setResult(isCorrect);
    if (isCorrect) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (index >= words.length - 1) { setDone(true); return; }
    setIndex((i) => i + 1);
    setInput("");
    setResult(null);
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (done) return (
    <div className="score-section">
      <p>Kết quả: {correct}/{words.length} câu đúng</p>
      <button className="submit-btn" onClick={load} style={{ marginTop: "1rem" }}>Làm lại</button>
    </div>
  );

  const w = words[index];
  return (
    <div>
      <p className="page-desc">Điền từ còn thiếu vào chỗ trống trong câu.</p>
      <p className="stress-counter">Câu {index + 1}/{words.length}</p>
      <div className="exercise-card">
        <div className="word-header" style={{ marginBottom: "0.5rem" }}>
          <strong className="word-text">{w.word}</strong>
          <SpeakButton text={w.word} />
          <span className="phonetic">{w.phonetic}</span>
          <span className="pos">{w.part_of_speech}</span>
        </div>
        <p className="word-meaning">{w.meaning}</p>
        <p className="ex-question" style={{ marginTop: "1rem", fontStyle: "italic", color: "#475569" }}>
          {maskWord(w.example || "", w.word)}
        </p>
        <input className="ex-input" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Gõ từ còn thiếu..." disabled={result !== null}
          onKeyDown={(e) => e.key === "Enter" && !result && input.trim() && check()} />
        {result !== null && (
          <p className={`ex-result ${result ? "ex-correct" : "ex-wrong"}`}>
            {result ? "✓ Đúng!" : `✗ Sai. Đáp án: ${w.word}`}
          </p>
        )}
      </div>
      {!result && <button className="submit-btn" disabled={!input.trim()} onClick={check}>Kiểm tra</button>}
      {result !== null && <button className="submit-btn" onClick={next}>{index < words.length - 1 ? "Tiếp theo" : "Xem kết quáº£"}</button>}
    </div>
  );
}

/* ─── EXERCISE QUIZ (vocab / grammar) ─── */
function ExerciseQuiz({ lessonType }: { lessonType: string }) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [difficulty, setDifficulty] = useState("beginner");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean | null>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<Exercise[]>(`/exercises?lesson_type=${lessonType}&difficulty=${difficulty}`).then((data) => {
      setExercises(data.map((ex) => ({ ...ex, options: ex.options ? shuffle([...ex.options]) : ex.options })));
      setAnswers({}); setResults({}); setShowAnswers(false); setLoading(false);
    });
  }, [lessonType, difficulty]);

  const handleAnswer = (id: number, answer: string) => setAnswers((p) => ({ ...p, [id]: answer }));

  const checkAll = async () => {
    const newResults: Record<number, boolean | null> = {};
    for (const ex of exercises) {
      const ans = answers[ex.id];
      if (!ans) { newResults[ex.id] = null; continue; }
      const res = await api.post<{ correct: boolean }>("/exercises/check", { exercise_id: ex.id, answer: ans });
      newResults[ex.id] = res.correct;
    }
    setResults(newResults);
    setShowAnswers(true);
    const correct = Object.values(newResults).filter(Boolean).length;
    try { await api.post("/progress/save", { user_id: user?.id ?? 1, lesson_type: "exercise", lesson_id: 0, completed: 1, score: Math.round((correct / exercises.length) * 100) }); } catch {}
  };

  const score = Object.values(results).filter(Boolean).length;
  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div>
      <div className="difficulty-tabs">
        {difficulties.map((d) => (
          <button key={d.value} className={`diff-tab ${difficulty === d.value ? "active" : ""}`}
            style={difficulty === d.value ? { background: d.color } : {}}
            onClick={() => setDifficulty(d.value)}>{d.label}</button>
        ))}
      </div>
      <div className="exercises-list">
        {exercises.map((ex) => (
          <div key={ex.id} className="exercise-card">
            <p className="ex-question">{ex.question}</p>
            {ex.options && (
              <div className="ex-options">
                {ex.options.map((opt, i) => (
                  <label key={i} className={`ex-option ${answers[ex.id] === opt ? "selected" : ""} ${showAnswers ? (opt === ex.correct_answer ? "correct" : answers[ex.id] === opt ? "wrong" : "") : ""}`}>
                    <input type="radio" name={`ex-${ex.id}`} value={opt} checked={answers[ex.id] === opt}
                      onChange={() => handleAnswer(ex.id, opt)} disabled={showAnswers} />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {!ex.options && (
              <input className="ex-input" value={answers[ex.id] || ""}
                onChange={(e) => handleAnswer(ex.id, e.target.value)} disabled={showAnswers}
                placeholder="Nhập câu trả lời..." />
            )}
            {showAnswers && results[ex.id] !== undefined && (
              <p className={`ex-result ${results[ex.id] === true ? "ex-correct" : results[ex.id] === false ? "ex-wrong" : ""}`}>
                {results[ex.id] === true ? "✓ Đúng!" : results[ex.id] === false ? `✗ Sai. Đáp án: ${ex.correct_answer}` : "⚠ Chưa trả lời"}
                {results[ex.id] === false && <span className="ex-explanation"> - {ex.explanation}</span>}
              </p>
            )}
          </div>
        ))}
      </div>
      {!showAnswers && <button className="submit-btn" onClick={checkAll}>Kiểm tra tất cả</button>}
      {showAnswers && <div className="score-section"><p>Kết quả: {score}/{exercises.length} đúng</p></div>}
      {exercises.length === 0 && <p className="empty">Chưa có bài tập cho cấp độ này.</p>}
    </div>
  );
}

/* ─── PRACTICE TEST ─── */
function PracticeTest({ user }: { user: any }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [difficulty, setDifficulty] = useState("beginner");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean | null>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<Exercise[]>(`/exercises?difficulty=${difficulty}`).then((data) => {
      setExercises(data.map((ex) => ({ ...ex, options: ex.options ? shuffle([...ex.options]) : ex.options })));
      setAnswers({}); setResults({}); setShowAnswers(false); setLoading(false);
    });
  }, [difficulty]);

  const handleAnswer = (id: number, answer: string) => setAnswers((p) => ({ ...p, [id]: answer }));

  const checkAll = async () => {
    const newResults: Record<number, boolean | null> = {};
    for (const ex of exercises) {
      const ans = answers[ex.id];
      if (!ans) { newResults[ex.id] = null; continue; }
      const res = await api.post<{ correct: boolean }>("/exercises/check", { exercise_id: ex.id, answer: ans });
      newResults[ex.id] = res.correct;
    }
    setResults(newResults);
    setShowAnswers(true);
    const correct = Object.values(newResults).filter(Boolean).length;
    try { await api.post("/progress/save", { user_id: user?.id ?? 1, lesson_type: "exercise", lesson_id: difficulties.findIndex((d) => d.value === difficulty) + 1, completed: 1, score: Math.round((correct / exercises.length) * 100) }); } catch {}
  };

  const score = Object.values(results).filter(Boolean).length;
  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div>
      <p className="page-desc">Bài kiểm tra tổng hợp gồm nhiều dạng câu hỏi.</p>
      <div className="difficulty-tabs">
        {difficulties.map((d) => (
          <button key={d.value} className={`diff-tab ${difficulty === d.value ? "active" : ""}`}
            style={difficulty === d.value ? { background: d.color } : {}}
            onClick={() => setDifficulty(d.value)}>{d.label}</button>
        ))}
      </div>
      <div className="exercises-list">
        {exercises.map((ex) => (
          <div key={ex.id} className="exercise-card">
            <p className="ex-question">{ex.question}</p>
            {ex.options && (
              <div className="ex-options">
                {ex.options.map((opt, i) => (
                  <label key={i} className={`ex-option ${answers[ex.id] === opt ? "selected" : ""} ${showAnswers ? (opt === ex.correct_answer ? "correct" : answers[ex.id] === opt ? "wrong" : "") : ""}`}>
                    <input type="radio" name={`ex-${ex.id}`} value={opt} checked={answers[ex.id] === opt}
                      onChange={() => handleAnswer(ex.id, opt)} disabled={showAnswers} />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {!ex.options && (
              <input className="ex-input" value={answers[ex.id] || ""}
                onChange={(e) => handleAnswer(ex.id, e.target.value)} disabled={showAnswers}
                placeholder="Nhập câu trả lời..." />
            )}
            {showAnswers && results[ex.id] !== undefined && (
              <p className={`ex-result ${results[ex.id] === true ? "ex-correct" : results[ex.id] === false ? "ex-wrong" : ""}`}>
                {results[ex.id] === true ? "✓ Đúng!" : results[ex.id] === false ? `✗ Sai. Đáp án: ${ex.correct_answer}` : "⚠ Chưa trả lời"}
                {results[ex.id] === false && <span className="ex-explanation"> - {ex.explanation}</span>}
              </p>
            )}
          </div>
        ))}
      </div>
      {!showAnswers && <button className="submit-btn" onClick={checkAll}>Kiểm tra tất cả</button>}
      {showAnswers && <div className="score-section"><p>Kết quả: {score}/{exercises.length} đúng</p></div>}
      {exercises.length === 0 && <p className="empty">Chưa có bài tập cho cấp độ này.</p>}
    </div>
  );
}
