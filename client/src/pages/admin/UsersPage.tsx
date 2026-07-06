import { useEffect, useState } from "react";
import { api } from "../../api";
import type { AdminUser } from "../../types";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  const fetchUsers = () => {
    api.get<AdminUser[]>("/admin/users").then(setUsers).catch(() => {});
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id: number) => {
    if (!confirm("Xóa người dùng này?")) return;
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  return (
    <div>
      <h1>Quản lý người dùng</h1>
      <table className="admin-table">
        <thead>
          <tr><th>ID</th><th>Tên</th><th>Email</th><th>Vai trò</th><th>Cấp độ</th><th>Ngày tạo</th><th>Hành động</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role === "admin" ? "Admin" : "User"}</td>
              <td>{u.level}</td>
              <td>{u.created_at}</td>
              <td>
                {u.role !== "admin" && (
                  <button className="admin-delete-btn" onClick={() => deleteUser(u.id)}>Xóa</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
