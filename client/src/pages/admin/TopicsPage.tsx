import { useEffect, useState } from "react";
import { api } from "../../api";
import type { AdminTopic } from "../../types";

export default function TopicsPage() {
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [form, setForm] = useState({ name: "", description: "", level: "beginner", icon: "📁", order_index: 0 });
  const [editing, setEditing] = useState<number | null>(null);

  const fetch = () => api.get<AdminTopic[]>("/admin/topics").then(setTopics).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (editing) {
      await api.put(`/admin/topics/${editing}`, form);
    } else {
      await api.post("/admin/topics", form);
    }
    setForm({ name: "", description: "", level: "beginner", icon: "📁", order_index: 0 });
    setEditing(null);
    fetch();
  };

  const edit = (t: any) => {
    setForm({ name: t.name, description: t.description, level: t.level, icon: t.icon, order_index: t.order_index });
    setEditing(t.id);
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa chủ đề này?")) return;
    await api.delete(`/admin/topics/${id}`);
    fetch();
  };

  const levels = ["beginner", "intermediate", "advanced"];

  return (
    <div>
      <h1>Quản lý chủ đề từ vựng</h1>

      <div className="admin-form">
        <input placeholder="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
          {levels.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <input placeholder="Icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="admin-input-sm" />
        <input type="number" placeholder="STT" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} className="admin-input-sm" />
        <button className="admin-btn" onClick={save}>{editing ? "Cập nhật" : "Thêm"}</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr><th>ID</th><th>Tên</th><th>Cấp độ</th><th>Hành động</th></tr>
        </thead>
        <tbody>
          {topics.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.icon} {t.name}</td>
              <td>{t.level}</td>
              <td>
                <button className="admin-edit-btn" onClick={() => edit(t)}>Sửa</button>
                <button className="admin-delete-btn" onClick={() => remove(t.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
