import { useEffect, useState } from "react";
import { useAuth } from "../context/auth";
import { api } from "../api";
import type { StressRule } from "../types";

export default function StressRules() {
  const { user } = useAuth();
  const [rules, setRules] = useState<StressRule[]>([]);
  const [selected, setSelected] = useState<StressRule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<StressRule[]>("/stress/rules").then((data) => {
      setRules(data);
      setLoading(false);
    });
  }, []);

  const selectRule = async (rule: StressRule) => {
    const data = await api.get<StressRule>(`/stress/rules/${rule.id}`);
    setSelected(data);
    try {
      await api.post("/progress/save", {
        user_id: user?.id ?? 1,
        lesson_type: "stress",
        lesson_id: rule.id,
        completed: 1,
        score: 100,
      });
    } catch {}
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="page">
      <h1>Trọng âm từ vựng</h1>
      {!selected ? (
        <div className="lessons-list">
          {rules.map((r) => (
            <button key={r.id} className="lesson-card" onClick={() => selectRule(r)}>
              <div className="lesson-header">
                <h3>{r.title}</h3>
              </div>
              <span className="lesson-category">{r.description}</span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button className="back-btn" onClick={() => setSelected(null)}>← Quay lại</button>
          <h2>{selected.title}</h2>
          <p className="stress-rule">{selected.rule}</p>
          {selected.examples && selected.examples.length > 0 && (
            <div className="examples-section">
              <h3>Ví dụ</h3>
              <table className="stress-table">
                <thead>
                  <tr>
                    <th>Từ</th>
                    <th>Phiên âm</th>
                    <th>Trọng âm</th>
                    <th>Giải thích</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.examples.map((ex, i) => (
                    <tr key={i}>
                      <td className="stress-word">{ex.word}</td>
                      <td className="stress-phonetic">{ex.phonetic}</td>
                      <td className="stress-part">{ex.stressed_part}</td>
                      <td className="stress-explanation">{ex.explanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
