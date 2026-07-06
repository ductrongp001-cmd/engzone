import { useEffect, useState } from "react";
import { api } from "../../api";
import type { AdminExercise } from "../../types";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<AdminExercise[]>([]);
  const [form, setForm] = useState({ type: "multiple_choice", question: "", options: [""], correct_answer: "", explanation: "", difficulty: "beginner" });
  const [editing, setEditing] = useState<number | null>(null);

  const fetch = () => api.get<AdminExercise[]>("/admin/exercises").then(setExercises).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const save = async () => {
    const opts = form.options.filter(Boolean);
    if (editing) {
      await api.put(`/admin/exercises/${editing}`, { ...form, options: opts });
    } else {
      await api.post("/admin/exercises", { ...form, options: opts });
    }
    setForm({ type: "multiple_choice", question: "", options: [""], correct_answer: "", explanation: "", difficulty: "beginner" });
    setEditing(null);
    fetch();
  };

  const edit = (ex: any) => {
    setForm({
      type: ex.type,
      question: ex.question,
      options: typeof ex.options === "string" ? JSON.parse(ex.options) : ex.options,
      correct_answer: ex.correct_answer,
      explanation: ex.explanation || "",
      difficulty: ex.difficulty || "beginner",
    });
    setEditing(ex.id);
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa bài tập này?")) return;
    await api.delete(`/admin/exercises/${id}`);
    fetch();
  };

  const addOption = () => setForm({ ...form, options: [...form.options, ""] });
  const setOption = (i: number, val: string) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm({ ...form, options: opts });
  };

  return (
    <div>
      <h1>Quản lý bài tập</h1>

      <div className="admin-form">
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="multiple_choice">Trắc nghiệm</option>
          <option value="fill_in_blank">Điền vào chỗ trống</option>
        </select>
        <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
          <option value="beginner">Cơ bản</option>
          <option value="intermediate">Trung cấp</option>
          <option value="advanced">Nâng cao</option>
        </select>
        <input placeholder="Câu hỏi" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        {form.options.map((opt, i) => (
          <input key={i} placeholder={`Đáp án ${i + 1}`} value={opt} onChange={(e) => setOption(i, e.target.value)} />
        ))}
        <button className="admin-btn admin-btn-sm" onClick={addOption}>+ Thêm đáp án</button>
        <input placeholder="Đáp án đúng" value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })} />
        <input placeholder="Giải thích" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
        <button className="admin-btn" onClick={save}>{editing ? "Cập nhật" : "Thêm"}</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr><th>ID</th><th>Loại</th><th>Câu hỏi</th><th>Cấp độ</th><th>Hành động</th></tr>
        </thead>
        <tbody>
          {exercises.map((ex) => (
            <tr key={ex.id}>
              <td>{ex.id}</td>
              <td>{ex.lesson_type === "multiple_choice" ? "Trắc nghiệm" : "Điền từ"}</td>
              <td>{ex.question.substring(0, 60)}...</td>
              <td>{ex.difficulty}</td>
              <td>
                <button className="admin-edit-btn" onClick={() => edit(ex)}>Sửa</button>
                <button className="admin-delete-btn" onClick={() => remove(ex.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
