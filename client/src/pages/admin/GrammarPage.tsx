import { useEffect, useState } from "react";
import { api } from "../../api";
import type { AdminGrammarLesson } from "../../types";

export default function GrammarPage() {
  const [lessons, setLessons] = useState<AdminGrammarLesson[]>([]);
  const [form, setForm] = useState({ title: "", content: "", level: "beginner", order_index: 0 });
  const [editing, setEditing] = useState<number | null>(null);

  const fetch = () => api.get<AdminGrammarLesson[]>("/admin/grammar").then(setLessons).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (editing) {
      await api.put(`/admin/grammar/${editing}`, form);
    } else {
      await api.post("/admin/grammar", form);
    }
    setForm({ title: "", content: "", level: "beginner", order_index: 0 });
    setEditing(null);
    fetch();
  };

  const edit = (l: any) => {
    setForm({ title: l.title, content: l.content, level: l.level, order_index: l.order_index });
    setEditing(l.id);
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa bài học này?")) return;
    await api.delete(`/admin/grammar/${id}`);
    fetch();
  };

  const levels = ["beginner", "intermediate", "advanced"];

  return (
    <div>
      <h1>Quản lý ngữ pháp</h1>

      <div className="admin-form">
        <input placeholder="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
          {levels.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <input type="number" placeholder="STT" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} className="admin-input-sm" />
        <textarea placeholder="Nội dung" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} />
        <button className="admin-btn" onClick={save}>{editing ? "Cập nhật" : "Thêm"}</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr><th>ID</th><th>Tiêu đề</th><th>Cấp độ</th><th>Hành động</th></tr>
        </thead>
        <tbody>
          {lessons.map((l) => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.title}</td>
              <td>{l.level}</td>
              <td>
                <button className="admin-edit-btn" onClick={() => edit(l)}>Sửa</button>
                <button className="admin-delete-btn" onClick={() => remove(l.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
