import { useEffect, useState } from "react";
import { api } from "../api";
import type { IrregularVerb } from "../types";

export default function IrregularVerbs() {
  const [verbs, setVerbs] = useState<IrregularVerb[]>([]);
  const [filtered, setFiltered] = useState<IrregularVerb[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    api.get<IrregularVerb[]>("/irregular-verbs/list").then((data) => {
      setVerbs(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(verbs);
      return;
    }
    setFiltered(
      verbs.filter(
        (v) =>
          v.base_form.toLowerCase().includes(q) ||
          v.past_simple.toLowerCase().includes(q) ||
          v.past_participle.toLowerCase().includes(q) ||
          v.meaning.toLowerCase().includes(q)
      )
    );
  }, [search, verbs]);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="page">
      <h1>Động từ bất quy tắc</h1>
      <p className="page-desc">Danh sách các động từ bất quy tắc thông dụng trong tiếng Anh</p>

      <div className="vocab-search-box">
        <input
          className="vocab-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Tìm động từ..."
        />
      </div>

      <p className="vocab-search-count">
        {filtered.length} / {verbs.length} động từ
      </p>

      <div className="irregular-table-wrapper">
        <table className="irregular-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Base Form</th>
              <th>Past Simple</th>
              <th>Past Participle</th>
              <th>Nghĩa</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => (
              <>
                <tr key={v.id} className="irregular-row" onClick={() => toggleExpand(v.id)}>
                  <td className="irregular-num">{i + 1}</td>
                  <td className="irregular-base">{v.base_form}</td>
                  <td className="irregular-past">{v.past_simple}</td>
                  <td className="irregular-pp">{v.past_participle}</td>
                  <td className="irregular-meaning">{v.meaning}</td>
                  <td className="irregular-expand">{expanded.has(v.id) ? "▲" : "▼"}</td>
                </tr>
                {expanded.has(v.id) && (
                  <tr key={`${v.id}-ex`} className="irregular-ex-row">
                    <td colSpan={6}>
                      <div className="irregular-example">
                        <strong>Ví dụ:</strong> <em>{v.example}</em>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
