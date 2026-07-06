import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "../api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  level: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("engzone_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem("engzone_token");
    if (!token) return;
    api.get<{ success: boolean; user: User }>("/auth/verify").then((res) => {
      if (res.success) {
        setUser(res.user);
        localStorage.setItem("engzone_user", JSON.stringify(res.user));
      }
    }).catch(() => {
      localStorage.removeItem("engzone_token");
      localStorage.removeItem("engzone_user");
      setUser(null);
    });
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("engzone_user", JSON.stringify(user));
    else localStorage.removeItem("engzone_user");
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ success: boolean; token?: string; user: User }>("/auth/login", { email, password });
    if (!res.success) throw new Error("Sai email hoặc mật khẩu");
    if (res.token) localStorage.setItem("engzone_token", res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    await api.post("/auth/register", { name, email, password });
  };

  const logout = () => {
    localStorage.removeItem("engzone_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
