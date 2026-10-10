import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../api";
import SpeakButton from "../components/SpeakButton";
import ExistingFlashcard from "./Flashcard";
import type { Word, GrammarLesson, Topic } from "../types";

function shuffle<T>(a: T[]) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const games = [
  { id: "flashcard", icon: "🃏", title: "Flashcard", desc: "Học từ vựng với thẻ lật", color: "#0891b2" },
  { id: "scramble", icon: "🔀", title: "Đảo chữ", desc: "Sắp xếp chữ cái thành từ đúng", color: "#059669" },
  { id: "matching", icon: "🧩", title: "Ghép cặp", desc: "Tìm cặp từ và nghĩa tương ứng", color: "#d97706" },
  { id: "quick-quiz", icon: "⚡", title: "Thi đấu nhanh", desc: "Trả lời nhanh trong 30 giây", color: "#dc2626" },
  { id: "listen-choose", icon: "🔊", title: "Nghe & Chọn", desc: "Nghe từ và chọn nghĩa đúng", color: "#7c3aed" },
  { id: "word-sort", icon: "📝", title: "Sắp xếp câu", desc: "Xếp các từ theo đúng thứ tự", color: "#0d9488" },
  { id: "quick-type", icon: "⌨️", title: "Gõ nhanh", desc: "Xem nghĩa, gõ từ tiếng Anh nhanh nhất", color: "#ca8a04" },
  { id: "topic-guess", icon: "🎯", title: "Phân loại từ", desc: "Đoán từ thuộc chủ đề nào", color: "#db2777" },
  { id: "grammar-quiz", icon: "📖", title: "Đố ngữ pháp", desc: "Điền từ còn thiếu vào câu", color: "#4f46e5" },
];

export default function Games() {
  const [view, setView] = useState<string | null>(null);
  const back = () => setView(null);

  if (!view) return (
    <div className="page">
      <h1>Trò chơi</h1>
      <div className="topics-grid">
        {games.map((g) => (
          <button key={g.id} className="topic-card" onClick={() => setView(g.id)} style={{ borderLeft: `4px solid ${g.color}` }}>
            <span className="topic-icon">{g.icon}</span>
            <div><h3>{g.title}</h3><p>{g.desc}</p></div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page">
      <button className="back-btn" onClick={back}>← Quay lại</button>
      {view === "flashcard" && <ExistingFlashcard />}
      {view === "scramble" && <GameScramble />}
      {view === "matching" && <GameMatching />}
      {view === "quick-quiz" && <GameQuickQuiz />}
      {view === "listen-choose" && <GameListenChoose />}
      {view === "word-sort" && <GameWordSort />}
      {view === "quick-type" && <GameQuickType />}
      {view === "topic-guess" && <GameTopicGuess />}
      {view === "grammar-quiz" && <GameGrammarQuiz />}
    </div>
  );
}

function useRandomWords() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const topics = await api.get<{ id: number }[]>("/vocabulary/topics");
      if (!topics.length) { setLoading(false); return; }
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const data = await api.get<Word[]>(`/vocabulary/topics/${topic.id}/words`);
      setWords(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  return { words, loading, reload: load };
}

/* ─── SCRAMBLE ─── */
function GameScramble() {
  const { words, loading, reload } = useRandomWords();
  const [quiz, setQuiz] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!words.length) return;
    const s = shuffle([...words]).slice(0, 10);
    setQuiz(s);
    setIndex(0); setInput(""); setResult(null); setDone(false); setCorrect(0);
  }, [words]);

  useEffect(() => {
    if (!quiz.length) return;
    const w = quiz[index].word;
    let s = w;
    while (s === w) s = shuffle(w.split("")).join("");
    setScrambled(s.toUpperCase());
    setInput(""); setResult(null);
    inputRef.current?.focus();
  }, [quiz, index]);

  const check = () => {
    const isCorrect = input.trim().toLowerCase() === quiz[index].word.toLowerCase();
    setResult(isCorrect);
    if (isCorrect) setCorrect(c => c + 1);
  };
  const next = () => { if (index >= quiz.length - 1) setDone(true); else setIndex(i => i + 1); };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!quiz.length) return <div className="loading">Không có từ nào.</div>;
  if (done) return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Kết quả: {correct}/{quiz.length} từ đúng</p>
      <button className="submit-btn" onClick={reload} style={{ marginTop: "1rem" }}>Làm lại</button>
    </div>
  );

  const w = quiz[index];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p className="page-desc">Sắp xếp các chữ cái để tạo thành từ đúng.</p>
      <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Từ {index + 1}/{quiz.length}</p>
      <div className="exercise-card" style={{ textAlign: "center", padding: "2rem" }}>
        <div className="game-scramble-letters">{scrambled}</div>
        <input ref={inputRef} className="ex-input" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Gõ từ đúng..." disabled={result !== null}
          onKeyDown={e => e.key === "Enter" && !result && input.trim() && check()} />
        {result !== null && (
          <p className={`ex-result ${result ? "ex-correct" : "ex-wrong"}`}>
            {result ? `✓ Đúng! (${w.meaning})` : `✗ Sai. Đáp án: ${w.word} — ${w.meaning}`}
          </p>
        )}
      </div>
      {result === null && <button className="submit-btn" disabled={!input.trim()} onClick={check}>Kiểm tra</button>}
      {result !== null && <button className="submit-btn" onClick={next}>{index < quiz.length - 1 ? "Tiếp theo" : "Xem kết quả"}</button>}
    </div>
  );
}

/* ─── MATCHING ─── */
interface MatchCard {
  uid: number;
  wordId: number;
  type: "word" | "meaning";
  text: string;
}

function GameMatching() {
  const { words, loading, reload } = useRandomWords();
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [locked, setLocked] = useState(false);
  const [pairsFound, setPairsFound] = useState(0);
  const [gameDone, setGameDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const init = useCallback(() => {
    if (words.length < 4) return;
    const selected = shuffle([...words]).slice(0, 6);
    const newCards: MatchCard[] = shuffle(
      selected.flatMap(w => [
        { uid: w.id * 2, wordId: w.id, type: "word", text: w.word },
        { uid: w.id * 2 + 1, wordId: w.id, type: "meaning", text: w.meaning },
      ])
    );
    setCards(newCards);
    setFlipped([]); setMatched(new Set()); setLocked(false); setPairsFound(0); setGameDone(false);
  }, [words]);

  useEffect(() => { init(); }, [init]);

  const flipCard = (uid: number) => {
    if (locked || flipped.includes(uid) || matched.has(uid) || flipped.length >= 2) return;
    const newFlipped = [...flipped, uid];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setLocked(true);
      const [a, b] = newFlipped;
      const cardA = cards.find(c => c.uid === a)!;
      const cardB = cards.find(c => c.uid === b)!;
      if (cardA.wordId === cardB.wordId && cardA.type !== cardB.type) {
        const next = new Set(matched);
        next.add(a); next.add(b);
        setMatched(next);
        setPairsFound(p => p + 1);
        setFlipped([]); setLocked(false);
        if (next.size === cards.length) setGameDone(true);
      } else {
        timerRef.current = setTimeout(() => { setFlipped([]); setLocked(false); }, 900);
      }
    }
  };
  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (cards.length === 0) return <div className="loading">Không đủ từ để chơi.</div>;
  if (gameDone) return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎉 Hoàn thành!</p>
      <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Bạn đã tìm được {pairsFound}/{cards.length / 2} cặp.</p>
      <button className="submit-btn" onClick={reload}>Chơi lại</button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p className="page-desc">Lật thẻ và tìm cặp từ - nghĩa tương ứng.</p>
      <p style={{ color: "#64748b", fontSize: "0.9rem", textAlign: "center" }}>Đã tìm: {pairsFound}/{cards.length / 2}</p>
      <div className="matching-grid">
        {cards.map(c => {
          const show = flipped.includes(c.uid) || matched.has(c.uid);
          return (
            <button key={c.uid} className={`matching-card ${show ? "flipped" : ""} ${matched.has(c.uid) ? "matched" : ""}`}
              onClick={() => flipCard(c.uid)} disabled={matched.has(c.uid)}>
              <div className="matching-inner">
                <div className="matching-front">?</div>
                <div className={`matching-back ${c.type === "word" ? "matching-word" : "matching-meaning"}`}>{c.text}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── QUICK QUIZ ─── */
function GameQuickQuiz() {
  const { words, loading, reload } = useRandomWords();
  const [quiz, setQuiz] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!words.length || words.length < 4) return;
    const selected = shuffle([...words]).slice(0, 10);
    setQuiz(selected);
    setIndex(0); setSelectedAnswer(null); setResult(null); setCorrect(0); setTimeLeft(30); setGameOver(false);
  }, [words]);

  const generateOptions = useCallback((w: Word, all: Word[]) => {
    const wrong = shuffle(all.filter(x => x.id !== w.id)).slice(0, 3);
    return shuffle([w.meaning, ...wrong.map(x => x.meaning)]);
  }, []);

  useEffect(() => {
    if (!quiz.length || gameOver) return;
    setOptions(generateOptions(quiz[index], quiz));
    setSelectedAnswer(null); setResult(null);
  }, [quiz, index, gameOver, generateOptions]);

  useEffect(() => {
    if (!quiz.length) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(intervalRef.current!); setGameOver(true); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [quiz]);

  const handleAnswer = (meaning: string) => {
    if (result !== null || gameOver) return;
    setSelectedAnswer(meaning);
    const isCorrect = meaning === quiz[index].meaning;
    setResult(isCorrect);
    if (isCorrect) setCorrect(c => c + 1);
    setTimeout(() => {
      if (index >= quiz.length - 1) setGameOver(true);
      else setIndex(i => i + 1);
    }, 800);
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!quiz.length) return <div className="loading">Không đủ từ để chơi (cần ít nhất 4 từ).</div>;

  if (gameOver) {
    const total = quiz.length;
    const pct = Math.round((correct / total) * 100);
    const rank = pct >= 90 ? "Xuất sắc! 🎉" : pct >= 70 ? "Tốt! 👍" : pct >= 50 ? "Khá! 💪" : "Cần cố gắng hơn!";
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏱ Hết giờ!</p>
        <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Kết quả: {correct}/{total} đúng ({pct}%)</p>
        <p style={{ fontSize: "1.1rem", marginBottom: "1rem", color: pct >= 70 ? "#059669" : "#dc2626" }}>{rank}</p>
        <button className="submit-btn" onClick={reload}>Chơi lại</button>
      </div>
    );
  }

  const w = quiz[index];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Từ {index + 1}/{quiz.length}</p>
        <div className={`game-quiz-timer ${timeLeft <= 10 ? "danger" : ""}`}>⏱ {timeLeft}s</div>
      </div>
      <div className="exercise-card" style={{ textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{w.word}</div>
        <SpeakButton text={w.word} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        {options.map((opt, i) => (
          <button key={i} className={`ex-option ${selectedAnswer === opt && result !== null ? (result ? "correct" : "wrong") : ""}`}
            onClick={() => handleAnswer(opt)} disabled={result !== null}
            style={result !== null && opt === quiz[index].meaning && selectedAnswer !== opt ? { background: "#d1fae5", borderColor: "#059669" } : {}}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── LISTEN & CHOOSE ─── */
function GameListenChoose() {
  const { words, loading, reload } = useRandomWords();
  const [quiz, setQuiz] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!words.length || words.length < 4) return;
    const s = shuffle([...words]).slice(0, 10);
    setQuiz(s);
    setIndex(0); setResult(null); setCorrect(0); setDone(false);
  }, [words]);

  useEffect(() => {
    if (!quiz.length || done) return;
    const w = quiz[index];
    const wrong = shuffle(quiz.filter(x => x.id !== w.id)).slice(0, 3);
    setOptions(shuffle([w.meaning, ...wrong.map(x => x.meaning)]));
    setResult(null);
  }, [quiz, index, done]);

  const handleAnswer = (meaning: string) => {
    if (result !== null) return;
    setResult(meaning === quiz[index].meaning);
    if (meaning === quiz[index].meaning) setCorrect(c => c + 1);
  };

  const next = () => { if (index >= quiz.length - 1) setDone(true); else setIndex(i => i + 1); };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!quiz.length) return <div className="loading">Không đủ từ.</div>;
  if (done) return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Kết quả: {correct}/{quiz.length} đúng</p>
      <button className="submit-btn" style={{ marginTop: "1rem" }} onClick={reload}>Làm lại</button>
    </div>
  );

  const w = quiz[index];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
      <p className="page-desc">Nghe từ và chọn nghĩa đúng.</p>
      <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Từ {index + 1}/{quiz.length}</p>
      <div className="exercise-card" style={{ textAlign: "center", padding: "2rem", width: "100%", maxWidth: 400 }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <SpeakButton text={w.word} />
        </div>
        {result !== null && <div style={{ marginBottom: "0.75rem", fontSize: "1.1rem", fontWeight: 600, color: "#4f46e5" }}>{w.word}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {options.map((opt, i) => {
            let cls = "ex-option";
            if (result !== null) { if (opt === w.meaning) cls += " correct"; else if (result === false && opt !== w.meaning) cls += " wrong"; }
            return (
              <button key={i} className={cls} onClick={() => handleAnswer(opt)} disabled={result !== null}>{opt}</button>
            );
          })}
        </div>
      </div>
      {result !== null && <button className="submit-btn" onClick={next}>{index < quiz.length - 1 ? "Tiếp theo" : "Xem kết quả"}</button>}
    </div>
  );
}

/* ─── WORD SORT ─── */
function GameWordSort() {
  const { words, loading, reload } = useRandomWords();
  const [quiz, setQuiz] = useState<{ word: Word; shuffled: string[] }[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!words.length) return;
    const withExamples = words.filter(w => w.example && w.example.split(/\s+/).length >= 4);
    const s = shuffle([...withExamples]).slice(0, 8);
    const q = s.map(w => ({ word: w, shuffled: shuffle(w.example!.split(/\s+/)) }));
    setQuiz(q);
    setIndex(0); setSelected([]); setResult(null); setCorrect(0); setDone(false);
  }, [words]);

  useEffect(() => {
    if (!quiz.length) return;
    const parts = quiz[index].shuffled;
    const used = new Set(selected);
    setRemaining(parts.filter((_, i) => !used.has(parts[i])));
  }, [quiz, index, selected]);

  const addWord = (word: string) => { if (result !== null) return; setSelected(prev => [...prev, word]); };
  const removeWord = (idx: number) => { if (result !== null) return; setSelected(prev => prev.filter((_, i) => i !== idx)); };

  const check = () => {
    const original = quiz[index].word.example!.split(/\s+/);
    const isCorrect = selected.length === original.length && selected.every((w, i) => w === original[i]);
    setResult(isCorrect);
    if (isCorrect) setCorrect(c => c + 1);
  };

  const next = () => { if (index >= quiz.length - 1) setDone(true); else { setIndex(i => i + 1); setSelected([]); setResult(null); } };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!quiz.length) return <div className="loading">Không có câu nào.</div>;
  if (done) return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Kết quả: {correct}/{quiz.length} câu đúng</p>
      <button className="submit-btn" style={{ marginTop: "1rem" }} onClick={reload}>Làm lại</button>
    </div>
  );

  const w = quiz[index];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p className="page-desc">Nhấn vào từ để xếp thành câu đúng.</p>
      <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Câu {index + 1}/{quiz.length}</p>
      <div className="exercise-card" style={{ padding: "1rem" }}>
        <div className="word-sort-row">
          {selected.map((word, i) => (
            <button key={i} className="word-sort-chip word-sort-used" onClick={() => removeWord(i)}>{word}</button>
          ))}
        </div>
        {selected.length > 0 && <hr className="word-sort-divider" />}
        <div className="word-sort-row">
          {remaining.map((word, i) => (
            <button key={i} className="word-sort-chip" onClick={() => addWord(word)} disabled={result !== null}>{word}</button>
          ))}
        </div>
        {result !== null && (
          <p className={`ex-result ${result ? "ex-correct" : "ex-wrong"}`} style={{ marginTop: "0.75rem" }}>
            {result ? "✓ Đúng!" : `✗ Sai. Đáp án: ${w.word.example}`}
          </p>
        )}
      </div>
      {result === null && <button className="submit-btn" disabled={selected.length === 0} onClick={check}>Kiểm tra</button>}
      {result !== null && <button className="submit-btn" onClick={next}>{index < quiz.length - 1 ? "Tiếp theo" : "Xem kết quả"}</button>}
    </div>
  );
}

/* ─── QUICK TYPE ─── */
function GameQuickType() {
  const { words, loading, reload } = useRandomWords();
  const [quiz, setQuiz] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [times, setTimes] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!words.length) return;
    const s = shuffle([...words]).slice(0, 10);
    setQuiz(s);
    setIndex(0); setInput(""); setResult(null); setCorrect(0); setDone(false); setTimes([]);
  }, [words]);

  useEffect(() => {
    if (!quiz.length || done) return;
    setInput(""); setResult(null);
    setStartTime(Date.now());
    inputRef.current?.focus();
  }, [quiz, index, done]);

  const check = () => {
    const isCorrect = input.trim().toLowerCase() === quiz[index].word.toLowerCase();
    setResult(isCorrect);
    if (isCorrect) { setCorrect(c => c + 1); setTimes(t => [...t, (Date.now() - startTime) / 1000]); }
  };

  const next = () => { if (index >= quiz.length - 1) setDone(true); else setIndex(i => i + 1); };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!quiz.length) return <div className="loading">Không có từ nào.</div>;
  if (done) return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Kết quả: {correct}/{quiz.length} từ đúng</p>
      {times.length > 0 && <p style={{ color: "#64748b", fontSize: "0.95rem" }}>TB: {(times.reduce((a, b) => a + b, 0) / times.length).toFixed(1)}s / từ</p>}
      <button className="submit-btn" style={{ marginTop: "1rem" }} onClick={reload}>Làm lại</button>
    </div>
  );

  const w = quiz[index];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p className="page-desc">Xem nghĩa tiếng Việt và gõ từ tiếng Anh nhanh nhất có thể.</p>
      <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Từ {index + 1}/{quiz.length}</p>
      <div className="exercise-card" style={{ textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#4f46e5", marginBottom: "0.5rem" }}>{w.meaning}</div>
        <div style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1rem" }}>{w.part_of_speech}</div>
        <input ref={inputRef} className="ex-input" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Gõ từ tiếng Anh..." disabled={result !== null}
          onKeyDown={e => e.key === "Enter" && !result && input.trim() && check()} />
        {result !== null && (
          <p className={`ex-result ${result ? "ex-correct" : "ex-wrong"}`}>
            {result ? `✓ Đúng! (${(Date.now() - startTime) / 1000}s)` : `✗ Sai. Đáp án: ${w.word} — ${w.phonetic}`}
          </p>
        )}
      </div>
      {result === null && <button className="submit-btn" disabled={!input.trim()} onClick={check}>Kiểm tra</button>}
      {result !== null && <button className="submit-btn" onClick={next}>{index < quiz.length - 1 ? "Tiếp theo" : "Xem kết quả"}</button>}
    </div>
  );
}

/* ─── TOPIC GUESS ─── */
function GameTopicGuess() {
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [words, setWords] = useState<{ word: Word; topicId: number }[]>([]);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const allTopics = await api.get<Topic[]>("/vocabulary/topics");
      if (allTopics.length < 2) { setLoading(false); return; }
      const selected = shuffle([...allTopics]).slice(0, 4);
      const results = await Promise.all(selected.map(t => api.get<Word[]>(`/vocabulary/topics/${t.id}/words`)));
      const mapped = results.flatMap((ws, i) => ws.map(w => ({ word: w, topicId: selected[i].id })));
      setTopics(selected);
      setWords(shuffle(mapped));
      setIndex(0); setResult(null); setCorrect(0); setDone(false);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pickTopic = (topicId: number) => {
    if (result !== null) return;
    setResult(topicId === words[index].topicId);
    if (topicId === words[index].topicId) setCorrect(c => c + 1);
  };

  const next = () => { if (index >= words.length - 1) setDone(true); else setIndex(i => i + 1); };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!topics.length || !words.length) return <div className="loading">Không đủ dữ liệu.</div>;
  if (done) return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Kết quả: {correct}/{words.length} từ đúng</p>
      <button className="submit-btn" style={{ marginTop: "1rem" }} onClick={load}>Chơi lại</button>
    </div>
  );

  const w = words[index];
  const t = topics.find(t => t.id === w.topicId)!;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p className="page-desc">Đoán xem từ thuộc chủ đề nào.</p>
      <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Từ {index + 1}/{words.length}</p>
      <div className="exercise-card" style={{ textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#4f46e5", marginBottom: "0.5rem" }}>{w.word.word}</div>
        <SpeakButton text={w.word.word} />
        <div className="game-guess-topics">
          {topics.map(t => {
            let cls = "ex-option";
            if (result !== null) { if (t.id === w.topicId) cls += " correct"; else if (result === false && t.id !== w.topicId) cls += " wrong"; }
            return (
              <button key={t.id} className={cls} onClick={() => pickTopic(t.id)} disabled={result !== null}>
                {t.icon} {t.name}
              </button>
            );
          })}
        </div>
        {result !== null && (
          <p className={`ex-result ${result ? "ex-correct" : "ex-wrong"}`} style={{ marginTop: "0.75rem" }}>
            {result ? "✓ Đúng!" : `✗ Sai. Đây là từ thuộc chủ đề "${t.name}"`}
            {w.word.phonetic && <span style={{ fontWeight: 400, color: "#64748b" }}> — {w.word.phonetic}: {w.word.meaning}</span>}
          </p>
        )}
      </div>
      {result !== null && <button className="submit-btn" onClick={next}>{index < words.length - 1 ? "Tiếp theo" : "Xem kết quả"}</button>}
    </div>
  );
}

/* ─── GRAMMAR QUIZ ─── */
function GameGrammarQuiz() {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<{ sentence: string; blanked: string; full: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const lessons = await api.get<GrammarLesson[]>("/grammar/lessons");
      const withExamples = lessons.filter(l => l.examples && l.examples.length > 0);
      if (!withExamples.length) { setLoading(false); return; }
      const selected = shuffle(withExamples).slice(0, 5);
      const allExamples = selected.flatMap(l => {
        const lesson = l.examples!;
        return lesson.map(ex => ({ ...ex, lessonTitle: l.title }));
      });
      const picked = shuffle(allExamples).slice(0, 10);
      const q = picked.map(ex => {
        const words = ex.sentence.split(/\s+/);
        const longWords = words.filter(w => w.replace(/[^a-zA-Z]/g, "").length >= 4);
        if (!longWords.length) return null;
        const pick = longWords[Math.floor(Math.random() * longWords.length)];
        return { sentence: ex.sentence.replace(new RegExp(pick.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "______"), blanked: pick.replace(/[^a-zA-Z]/g, ""), full: ex.sentence };
      }).filter((x): x is NonNullable<typeof x> => x !== null);
      setQuiz(q);
      setIndex(0); setInput(""); setResult(null); setCorrect(0); setDone(false);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!quiz.length || done) return; setInput(""); setResult(null); inputRef.current?.focus(); }, [quiz, index, done]);

  const check = () => {
    const isCorrect = input.trim().toLowerCase() === quiz[index].blanked.toLowerCase();
    setResult(isCorrect);
    if (isCorrect) setCorrect(c => c + 1);
  };

  const next = () => { if (index >= quiz.length - 1) setDone(true); else setIndex(i => i + 1); };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!quiz.length) return <div className="loading">Không có câu ngữ pháp nào.</div>;
  if (done) return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Kết quả: {correct}/{quiz.length} câu đúng</p>
      <button className="submit-btn" style={{ marginTop: "1rem" }} onClick={load}>Làm lại</button>
    </div>
  );

  const q = quiz[index];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p className="page-desc">Điền từ còn thiếu vào chỗ trống.</p>
      <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Câu {index + 1}/{quiz.length}</p>
      <div className="exercise-card" style={{ padding: "2rem" }}>
        <p className="ex-question">{q.sentence}</p>
        <input ref={inputRef} className="ex-input" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Gõ từ còn thiếu..." disabled={result !== null}
          onKeyDown={e => e.key === "Enter" && !result && input.trim() && check()} />
        {result !== null && (
          <p className={`ex-result ${result ? "ex-correct" : "ex-wrong"}`}>
            {result ? `✓ Đúng!` : `✗ Sai. Đáp án: ${q.blanked}`}
            <span className="ex-explanation"> — {q.full}</span>
          </p>
        )}
      </div>
      {result === null && <button className="submit-btn" disabled={!input.trim()} onClick={check}>Kiểm tra</button>}
      {result !== null && <button className="submit-btn" onClick={next}>{index < quiz.length - 1 ? "Tiếp theo" : "Xem kết quả"}</button>}
    </div>
  );
}
