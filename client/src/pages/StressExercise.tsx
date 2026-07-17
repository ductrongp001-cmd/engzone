import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import type { Exercise } from "../types";

function shuffle<T>(a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StressExercise() {
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Exercise[]>("/exercises?lesson_type=stress").then((data) => {
      const shuffled = shuffle(data).map((ex) => ({
        ...ex,
        options: ex.options ? shuffle([...ex.options]) : ex.options,
      }));
      setAllExercises(shuffled);
      setLoading(false);
    });
  }, []);

  const current = allExercises[index];

  const handleSelect = useCallback(async (answer: string) => {
    if (selected !== null) return;
    setSelected(answer);
    const res = await api.post<{ correct: boolean }>("/exercises/check", {
      exercise_id: current.id,
      answer,
    });
    setResult(res.correct);
    if (res.correct) setScore((s) => s + 1);
  }, [selected, current]);

  const handleNext = useCallback(() => {
    if (index < allExercises.length - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setResult(null);
    } else {
      setDone(true);
    }
  }, [index, allExercises.length]);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (done) {
    const pct = Math.round((score / allExercises.length) * 100);
    return (
      <div className="page">
        <h1>Luyện tập trọng âm</h1>
        <div className="score-section">
          <p>Kết quả: {score}/{allExercises.length} đúng ({pct}%)</p>
        </div>
        <button className="submit-btn" onClick={() => {
          const shuffled = shuffle([...allExercises]).map((ex) => ({
            ...ex,
            options: ex.options ? shuffle([...ex.options]) : ex.options,
          }));
          setAllExercises(shuffled);
          setIndex(0);
          setSelected(null);
          setResult(null);
          setScore(0);
          setDone(false);
        }}>
          Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Luyện tập trọng âm</h1>
      <p className="stress-counter">Câu {index + 1}/{allExercises.length}</p>
      <div className="exercise-card">
        <p className="ex-question">{current.question}</p>
        {current.options && (
          <div className="ex-options">
            {current.options.map((opt, i) => {
              let cls = "ex-option";
              if (selected === opt) cls += " selected";
              if (result !== null && opt === current.correct_answer) cls += " correct";
              if (result !== null && selected === opt && !result) cls += " wrong";
              return (
                <button key={i} className={cls} onClick={() => handleSelect(opt)} disabled={selected !== null}>
                  {opt}
                </button>
              );
            })}
          </div>
        )}
        {result !== null && (
          <p className={`ex-result ${result ? "ex-correct" : "ex-wrong"}`}>
            {result ? "✓ Đúng!" : `✗ Sai. Đáp án: ${current.correct_answer}`}
            <br />
            <span className="ex-explanation">{current.explanation}</span>
          </p>
        )}
      </div>
      {selected !== null && (
        <button className="submit-btn" onClick={handleNext}>
          {index < allExercises.length - 1 ? "Câu tiếp →" : "Xem kết quả"}
        </button>
      )}
    </div>
  );
}
