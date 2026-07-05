import { useEffect, useState } from "react";
import { api } from "../api";
import type { GrammarLesson } from "../types";

const levelColors: Record<string, string> = {
  beginner: "#4f46e5",
  intermediate: "#0891b2",
  advanced: "#7c3aed",
};

export default function Grammar() {
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [selected, setSelected] = useState<GrammarLesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<GrammarLesson[]>("/grammar/lessons").then((data) => {
      setLessons(data);
      setLoading(false);
    });
  }, []);

  const selectLesson = async (lesson: GrammarLesson) => {
    const data = await api.get<GrammarLesson>(`/grammar/lessons/${lesson.id}`);
    setSelected(data);
    try {
      await api.post("/progress/save", {
        user_id: 1,
        lesson_type: "grammar",
        lesson_id: lesson.id,
        completed: 1,
        score: 100,
      });
    } catch {}
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="page">
      <h1>Ngữ pháp</h1>
      {!selected ? (
        <div className="lessons-list">
          {lessons.map((l) => (
            <button key={l.id} className="lesson-card" onClick={() => selectLesson(l)}>
              <div className="lesson-header">
                <h3>{l.title}</h3>
                <span className="level-badge" style={{ background: levelColors[l.level] }}>
                  {l.level === "beginner" ? "Cơ bản" : l.level === "intermediate" ? "Trung cấp" : "Nâng cao"}
                </span>
              </div>
              <span className="lesson-category">{l.category}</span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button className="back-btn" onClick={() => setSelected(null)}>← Quay lại</button>
          <h2>{selected.title}</h2>
          <span className="level-badge" style={{ background: levelColors[selected.level] }}>
            {selected.level === "beginner" ? "Cơ bản" : selected.level === "intermediate" ? "Trung cấp" : "Nâng cao"}
          </span>
          <div className="lesson-content">
            {selected.content.split("\n").map((line, i) => (
              <p key={i}>{line || "\u00A0"}</p>
            ))}
          </div>
          {selected.examples && selected.examples.length > 0 && (
            <div className="examples-section">
              <h3>Ví dụ</h3>
              {selected.examples.map((ex, i) => (
                <div key={i} className="example-card">
                  <p className="example-sentence">{ex.sentence}</p>
                  <p className="example-translation">{ex.translation}</p>
                  <p className="example-explanation">{ex.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
