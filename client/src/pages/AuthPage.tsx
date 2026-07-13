import { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import { api } from "../api";

const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL || "/api"}/auth/google`;

export default function AuthPage() {
  const { user, login, register, logout } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("engzone_token", token);
      api.get<{ success: boolean; user: any }>("/auth/verify").then((res) => {
        if (res.success) {
          localStorage.setItem("engzone_user", JSON.stringify(res.user));
          window.location.href = "/";
        }
      });
    }
  }, []);

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

      <div className="auth-divider"><span>Hoặc</span></div>

      <a href={GOOGLE_AUTH_URL} className="auth-btn auth-btn-google">
        <svg width="20" height="20" viewBox="0 0 24 24" style={{verticalAlign:"middle",marginRight:8}}>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Đăng nhập với Google
      </a>
    </div>
  );
}
