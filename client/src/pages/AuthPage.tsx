import { useState } from "react";
import { useAuth } from "../context/auth";

export default function AuthPage() {
  const { user, login, register, logout } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="page">
        <h1>Tài khoản</h1>
        <div className="auth-profile">
          <div className="auth-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <h2>{user.name}</h2>
          <p className="auth-email">{user.email}</p>
          <p className="auth-level">Trình độ: {user.level}</p>
          <button className="auth-btn auth-btn-logout" onClick={logout}>Đăng xuất</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "register") {
        await register(name, email, password);
        await login(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <h1>{tab === "login" ? "Đăng nhập" : "Đăng ký"}</h1>

      <div className="auth-tabs">
        <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Đăng nhập</button>
        <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Đăng ký</button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        {tab === "register" && (
          <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ tên" required />
        )}
        <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" required />
        <button className="auth-btn auth-btn-submit" disabled={loading}>
          {loading ? "Đang xử lý..." : tab === "login" ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}
