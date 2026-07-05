import { Link } from "react-router-dom";

const features = [
  { title: "Từ vựng", desc: "Học từ vựng theo chủ đề từ cơ bản đến nâng cao", path: "/vocabulary", icon: "📚", color: "#4f46e5" },
  { title: "Ngữ pháp", desc: "Ngữ pháp từ thì hiện tại đơn đến cấu trúc nâng cao", path: "/grammar", icon: "📖", color: "#0891b2" },
  { title: "Bài tập", desc: "Trắc nghiệm kiểm tra kiến thức theo từng cấp độ", path: "/exercises", icon: "✍️", color: "#059669" },
  { title: "Tiến độ", desc: "Theo dõi quá trình học tập và thống kê kết quả", path: "/progress", icon: "📊", color: "#7c3aed" },
  { title: "Từ điển", desc: "Tra cứu bất kỳ từ nào với nghĩa, phát âm, ví dụ", path: "/dictionary", icon: "📖", color: "#d946ef" },
];

const levels = [
  { name: "Cơ bản (Beginner)", desc: "Greetings, numbers, daily life, present tenses", color: "#4f46e5" },
  { name: "Trung cấp (Intermediate)", desc: "Travel, work, past tenses, conditionals", color: "#0891b2" },
  { name: "Nâng cao (Advanced)", desc: "Academic, business, subjunctive, inversion", color: "#7c3aed" },
];

export default function Home() {
  return (
    <div>
      <section className="hero-section">
        <h1>Học tiếng Anh từ cơ bản đến nâng cao</h1>
        <p className="hero-sub">
          Lộ trình học bài bản từ trình độ sơ cấp đến đại học và hơn thế nữa
        </p>
        <Link to="/vocabulary" className="cta-button">Bắt đầu học ngay</Link>
      </section>

      <section className="features-section">
        <h2>Tính năng chính</h2>
        <div className="features-grid">
          {features.map((f) => (
            <Link to={f.path} key={f.title} className="feature-card" style={{ borderTopColor: f.color }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="levels-section">
        <h2>Lộ trình học</h2>
        <div className="levels-list">
          {levels.map((l) => (
            <div key={l.name} className="level-item" style={{ borderLeftColor: l.color }}>
              <h3>{l.name}</h3>
              <p>{l.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
