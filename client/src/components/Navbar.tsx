import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";

const links = [
  { to: "/", label: "Trang chủ" },
  { to: "/vocabulary", label: "Từ vựng" },
  { to: "/grammar", label: "Ngữ pháp" },
  { to: "/exercises", label: "Bài tập" },
  { to: "/irregular-verbs", label: "Động từ bất quy tắc" },
  { to: "/stress-rules", label: "Trọng âm" },
  { to: "/stress-exercise", label: "Luyện trọng âm" },
  { to: "/progress", label: "Tiến độ" },
  { to: "/dictionary", label: "Từ điển" },
  { to: "/flashcard", label: "Flashcard" },
  { to: "/quiz", label: "Thi thử" },
];

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("engzone_dark") === "true";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("engzone_dark", String(next));
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">EngZone</Link>
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={location.pathname === link.to ? "nav-link active" : "nav-link"}
          >
            {link.label}
          </Link>
        ))}
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className={location.pathname.startsWith("/admin") ? "nav-link active" : "nav-link"}
          >
            Admin
          </Link>
        )}
        <button className="nav-btn" onClick={toggleDark} title="Dark mode">
          {dark ? "☀️" : "🌙"}
        </button>
        {user ? (
          <div className="nav-user">
            <Link to="/auth" className="nav-link">{user.name}</Link>
            <button className="nav-btn" onClick={logout}>Thoát</button>
          </div>
        ) : (
          <Link to="/auth" className="nav-link auth-link">Đăng nhập</Link>
        )}
      </div>
    </nav>
  );
}
