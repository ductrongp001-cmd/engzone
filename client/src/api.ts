const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function getError(res: Response): Promise<string> {
  try { const d = await res.json(); return d.error || d.message || res.statusText; } catch { return res.statusText; }
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, { headers: this.getHeaders(false) });
    if (!res.ok) throw new Error(await getError(res));
    return res.json();
  },
  async post<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await getError(res));
    return res.json();
  },
  async put<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await getError(res));
    return res.json();
  },
  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await getError(res));
    return res.json();
  },
  getHeaders(includeContentType: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {};
    if (includeContentType) headers["Content-Type"] = "application/json";
    const token = localStorage.getItem("engzone_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      const user = localStorage.getItem("engzone_user");
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed.role) headers["x-user-role"] = parsed.role;
      }
    }
    return headers;
  },
};
