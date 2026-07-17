import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/auth";
import { api } from "../api";

export default function AuthPage() {
  const { user, login, register, logout } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (!googleBtnRef.current || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: "89937547406-kqett2mrun1fnm8ac6ii315kt7grurs3.apps.googleusercontent.com",
        callback: async (response: any) => {
          try {
            setLoading(true);
            const res = await api.post<{ success: boolean; token?: string; user: any }>("/auth/google", { credential: response.credential });
            if (res.success && res.token) {
              localStorage.setItem("engzone_token", res.token);
              localStorage.setItem("engzone_user", JSON.stringify(res.user));
              window.location.href = "/";
            }
          } catch {
            setError("Đăng nhập Google thất bại");
          } finally {
            setLoading(false);
          }
        },
        cancel_on_tap_outside: false,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current!, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: "signin_with",
        size: "large",
        width: 280,
      });
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
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

      <div ref={googleBtnRef} style={{display:"flex",justifyContent:"center"}}></div>
    </div>
  );
}
