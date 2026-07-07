import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/auth";
import { api } from "../api";
import type { Exercise } from "../types";

function shuffle<T>(a: T[]) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const difficulties = [
  { value: "beginner", label: "Cơ bản", color: "#4f46e5" },
  { value: "intermediate", label: "Trung cấp", color: "#0891b2" },
  { value: "advanced", label: "Nâng cao", color: "#7c3aed" },
];

export default function Quiz() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [difficulty, setDifficulty] = useState("beginner");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; answer: string }[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);

  const loadExercises = async (diff: string) => {
    setLoading(true);
    const data = await api.get<Exercise[]>(`/exercises?difficulty=${diff}`);
    const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 10).map(ex => ({ ...ex, options: ex.options ? shuffle([...ex.options]) : ex.options }));
    setExercises(shuffled);
    setCurrent(0);
    setScore(0);
    setAnswers([]);
    setFinished(false);
    setSelected("");
    setTimeLeft(30);
    setLoading(false);
  };

  useEffect(() => {
    loadExercises(difficulty);
  }, [difficulty]);

  useEffect(() => {
    if (finished || loading || exercises.length === 0) return;
    if (timeLeft <= 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finished, loading, exercises.length]);

  const handleNext = useCallback(() => {
    const isCorrect = selected === exercises[current].correct_answer;
    const newAnswers = [...answers, { correct: isCorrect, answer: selected || "(hết giờ)" }];
    setAnswers(newAnswers);
    if (isCorrect) setScore((s) => s + 1);

    if (current + 1 >= exercises.length) {
      setFinished(true);
      const pct = Math.round(((score + (isCorrect ? 1 : 0)) / exercises.length) * 100);
      try {
        api.post("/progress/save", {
          user_id: user?.id ?? 1, lesson_type: "exercise", lesson_id: 0, completed: 1, score: pct,
        });
      } catch {}
    } else {
      setCurrent((c) => c + 1);
      setSelected("");
      setTimeLeft(30);
    }
  }, [selected, exercises, current, answers, score]);

  const restart = () => {
    loadExercises(difficulty);
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  if (exercises.length === 0) return <div className="page"><h1>Thi thử</h1><p className="empty">Chưa có câu hỏi cho cấp độ này.</p></div>;

  if (finished) {
    const pct = Math.round((score / exercises.length) * 100);
    return (
      <div className="page">
        <h1>Thi thử</h1>
        <div className="quiz-result">
          <div className={`quiz-score-circle ${pct >= 80 ? "score-high" : pct >= 50 ? "score-mid" : "score-low"}`}>
            {score}/{exercises.length}
          </div>
          <h2>{pct >= 80 ? "Xuất sắc! 🎉" : pct >= 50 ? "Khá tốt! 👍" : "Cần cố gắng hơn 💪"}</h2>
          <p className="quiz-pct">{pct}% đúng</p>
          <div className="quiz-review">
            {answers.map((a, i) => (
              <div key={i} className={`quiz-review-item ${a.correct ? "correct" : "wrong"}`}>
                <span>{i + 1}. {exercises[i].question}</span>
                <span className="quiz-review-ans">
                  {a.correct ? "✓" : `✗ (Đáp án: ${exercises[i].correct_answer})`}
                </span>
              </div>
            ))}
          </div>
          <button className="quiz-btn" onClick={restart}>Thi lại</button>
        </div>
      </div>
    );
  }

  const ex = exercises[current];
  const progress = ((current + 1) / exercises.length) * 100;

  return (
    <div className="page">
      <h1>Thi thử</h1>
      <div className="difficulty-tabs">
        {difficulties.map((d) => (
          <button key={d.value} className={`diff-tab ${difficulty === d.value ? "active" : ""}`}
            style={difficulty === d.value ? { background: d.color } : {}}
            onClick={() => { setDifficulty(d.value); setLoading(true); }}
          >{d.label}</button>
        ))}
      </div>

      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="quiz-info">
        <span>Câu {current + 1}/{exercises.length}</span>
        <span className={`quiz-timer ${timeLeft <= 10 ? "timer-warn" : ""}`}>⏱ {timeLeft}s</span>
      </div>

      <div className="quiz-card">
        <p className="quiz-question">{ex.question}</p>
        {ex.options && (
          <div className="quiz-options">
            {ex.options.map((opt, i) => (
              <button key={i} className={`quiz-option ${selected === opt ? "selected" : ""}`}
                onClick={() => setSelected(opt)}>{opt}</button>
            ))}
          </div>
        )}
      </div>

      <button className="quiz-btn" onClick={handleNext} disabled={!selected && timeLeft > 0}>
        {current + 1 >= exercises.length ? "Kết thúc" : "Câu tiếp →"}
      </button>
    </div>
  );
}
