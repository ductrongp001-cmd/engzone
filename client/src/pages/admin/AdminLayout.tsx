import { Link, Outlet, useLocation } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/users", label: "Người dùng", icon: "👥" },
  { to: "/admin/topics", label: "Từ vựng", icon: "📝" },
  { to: "/admin/grammar", label: "Ngữ pháp", icon: "📖" },
  { to: "/admin/exercises", label: "Bài tập", icon: "✍️" },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`admin-sidebar-link${location.pathname === link.to ? " active" : ""}`}
          >
            {link.icon} {link.label}
          </Link>
        ))}
        <Link to="/" className="admin-sidebar-link back-link">← Về trang chủ</Link>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
