import { useEffect, useState } from "react";
import { api } from "../../api";
import type { AdminStats } from "../../types";

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.get<AdminStats>("/admin/stats").then(setStats).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: "Chủ đề từ vựng", value: stats.topics, color: "#3b82f6" },
    { label: "Từ vựng", value: stats.words, color: "#10b981" },
    { label: "Bài học ngữ pháp", value: stats.grammar, color: "#f59e0b" },
    { label: "Bài tập", value: stats.exercises, color: "#8b5cf6" },
    { label: "Người dùng", value: stats.users, color: "#ef4444" },
  ] : [];

  return (
    <div>
      <h1>Dashboard</h1>
      {stats ? (
        <div className="admin-cards">
          {cards.map((card) => (
            <div key={card.label} className="admin-card" style={{ borderTopColor: card.color }}>
              <div className="admin-card-value">{card.value}</div>
              <div className="admin-card-label">{card.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <p>Đang tải...</p>
      )}
    </div>
  );
}
