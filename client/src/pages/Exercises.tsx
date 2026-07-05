import { useEffect, useState } from "react";
import { api } from "../api";
import type { Exercise } from "../types";

const difficulties = [
  { value: "beginner", label: "Cơ bản", color: "#4f46e5" },
  { value: "intermediate", label: "Trung cấp", color: "#0891b2" },
  { value: "advanced", label: "Nâng cao", color: "#7c3aed" },
];

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [difficulty, setDifficulty] = useState("beginner");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean | null>>({});
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get<Exercise[]>(`/exercises?difficulty=${difficulty}`).then((data) => {
      setExercises(data);
      setAnswers({});
      setResults({});
      setShowAnswers(false);
      setLoading(false);
    });
  }, [difficulty]);

  const handleAnswer = (exerciseId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [exerciseId]: answer }));
  };

  const checkAll = async () => {
    const newResults: Record<number, boolean | null> = {};
    for (const ex of exercises) {
      const ans = answers[ex.id];
      if (!ans) {
        newResults[ex.id] = null;
        continue;
      }
      try {
        const res = await api.post<{ correct: boolean }>("/exercises/check", {
          exercise_id: ex.id,
          answer: ans,
        });
        newResults[ex.id] = res.correct;
      } catch {
        newResults[ex.id] = null;
      }
    }
    setResults(newResults);
    setShowAnswers(true);
    const correctCount = Object.values(newResults).filter(Boolean).length;
    const pct = Math.round((correctCount / exercises.length) * 100);
    try {
      await api.post("/progress/save", {
        user_id: 1,
        lesson_type: "exercise",
        lesson_id: difficulties.findIndex((d) => d.value === difficulty) + 1,
        completed: 1,
        score: pct,
      });
    } catch {}
  };

  const score = Object.values(results).filter(Boolean).length;

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="page">
      <h1>Bài tập</h1>
      <div className="difficulty-tabs">
        {difficulties.map((d) => (
          <button
            key={d.value}
            className={`diff-tab ${difficulty === d.value ? "active" : ""}`}
            style={difficulty === d.value ? { background: d.color } : {}}
            onClick={() => setDifficulty(d.value)}
          >
            {d.label}
          </button>
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
                    <input
                      type="radio"
                      name={`ex-${ex.id}`}
                      value={opt}
                      checked={answers[ex.id] === opt}
                      onChange={() => handleAnswer(ex.id, opt)}
                      disabled={showAnswers}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {!ex.options && (
              <input
                className="ex-input"
                value={answers[ex.id] || ""}
                onChange={(e) => handleAnswer(ex.id, e.target.value)}
                disabled={showAnswers}
                placeholder="Nhập câu trả lời..."
              />
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

      {!showAnswers && (
        <button className="submit-btn" onClick={checkAll}>
          Kiểm tra tất cả
        </button>
      )}

      {showAnswers && (
        <div className="score-section">
          <p>Kết quả: {score}/{exercises.length} đúng</p>
        </div>
      )}

      {exercises.length === 0 && <p className="empty">Chưa có bài tập cho cấp độ này.</p>}
    </div>
  );
}
