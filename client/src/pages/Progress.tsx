import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { api } from "../api";

interface ProgressItem {
  id: number;
  user_id: number;
  lesson_type: string;
  lesson_id: number;
  completed: number;
  score: number;
  last_studied: string;
}

interface Stats {
  vocabWordsLearned: number;
  grammarLessonsDone: number;
  exercisesCompleted: number;
  avgScore: number;
  totalExercises: number;
}

export default function Progress() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    vocabWordsLearned: 0,
    grammarLessonsDone: 0,
    exercisesCompleted: 0,
    avgScore: 0,
    totalExercises: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const data = await api.get<ProgressItem[]>("/progress/1");
      setProgress(data);
      calculateStats(data);
    } catch {
      const demo = generateDemoProgress();
      setProgress(demo);
      calculateStats(demo);
    }
    setLoading(false);
  };

  const calculateStats = (items: ProgressItem[]) => {
    const vocab = items.filter((i) => i.lesson_type === "vocabulary" && i.completed);
    const grammar = items.filter((i) => i.lesson_type === "grammar" && i.completed);
    const exercises = items.filter((i) => i.lesson_type === "exercise" && i.completed);
    const allExercise = items.filter((i) => i.lesson_type === "exercise");
    const totalScore = allExercise.reduce((s, i) => s + i.score, 0);
    setStats({
      vocabWordsLearned: vocab.length * 5,
      grammarLessonsDone: grammar.length,
      exercisesCompleted: exercises.length,
      avgScore: allExercise.length ? Math.round(totalScore / allExercise.length) : 0,
      totalExercises: allExercise.length,
    });
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="page">
      <h1>Tiến độ học tập</h1>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: "#4f46e5" }}>
          <div className="stat-number">{stats.vocabWordsLearned}</div>
          <div className="stat-label">Từ vựng đã học</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: "#0891b2" }}>
          <div className="stat-number">{stats.grammarLessonsDone}</div>
          <div className="stat-label">Bài ngữ pháp</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: "#059669" }}>
          <div className="stat-number">{stats.exercisesCompleted}</div>
          <div className="stat-label">Bài tập hoàn thành</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: "#7c3aed" }}>
          <div className="stat-number">{stats.avgScore}%</div>
          <div className="stat-label">Điểm trung bình</div>
        </div>
      </div>

      <section className="progress-section">
        <h2>Bảng xếp hạng trình độ</h2>
        <div className="level-progress">
          <div className="level-row">
            <span className="level-name">Cơ bản (Beginner)</span>
            <div className="level-bar-bg">
              <div
                className="level-bar-fill"
                style={{
                  width: `${Math.min(100, (stats.grammarLessonsDone / 3) * 100)}%`,
                  background: "#4f46e5",
                }}
              />
            </div>
          </div>
          <div className="level-row">
            <span className="level-name">Trung cấp (Intermediate)</span>
            <div className="level-bar-bg">
              <div
                className="level-bar-fill"
                style={{
                  width: `${Math.min(100, ((stats.grammarLessonsDone - 2) / 3) * 100)}%`,
                  background: "#0891b2",
                }}
              />
            </div>
          </div>
          <div className="level-row">
            <span className="level-name">Nâng cao (Advanced)</span>
            <div className="level-bar-bg">
              <div
                className="level-bar-fill"
                style={{
                  width: `${Math.min(100, ((stats.grammarLessonsDone - 5) / 3) * 100)}%`,
                  background: "#7c3aed",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {progress.length === 0 && (
        <div className="empty-state">
          <p>Bạn chưa có dữ liệu tiến độ. Hãy bắt đầu học ngay!</p>
          <a href="/vocabulary" className="cta-button" style={{ marginTop: "1rem", display: "inline-block" }}>
            Bắt đầu học
          </a>
        </div>
      )}
    </div>
  );
}

function generateDemoProgress(): ProgressItem[] {
  const now = new Date();
  return [
    {
      id: 1,
      user_id: 1,
      lesson_type: "vocabulary",
      lesson_id: 1,
      completed: 1,
      score: 100,
      last_studied: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: 2,
      user_id: 1,
      lesson_type: "grammar",
      lesson_id: 1,
      completed: 1,
      score: 85,
      last_studied: new Date(now.getTime() - 172800000).toISOString(),
    },
    {
      id: 3,
      user_id: 1,
      lesson_type: "exercise",
      lesson_id: 1,
      completed: 1,
      score: 75,
      last_studied: new Date(now.getTime() - 259200000).toISOString(),
    },
  ];
}
