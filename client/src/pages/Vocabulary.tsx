import { useEffect, useState } from "react";
import { useAuth } from "../context/auth";
import { api } from "../api";
import SpeakButton from "../components/SpeakButton";
import type { Topic, Word } from "../types";

const levelColors: Record<string, string> = {
  beginner: "#4f46e5",
  intermediate: "#0891b2",
  advanced: "#7c3aed",
};

const levelLabels: Record<string, string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

interface SearchWord extends Word {
  topic_name: string;
}

export default function Vocabulary() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchWord[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.get<Topic[]>("/vocabulary/topics").then((data) => {
      setTopics(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api.get<SearchWord[]>(`/vocabulary/search?q=${encodeURIComponent(search.trim())}`);
        setSearchResults(data);
      } catch {}
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const selectTopic = async (topic: Topic) => {
    setSelectedTopic(topic);
    const data = await api.get<Word[]>(`/vocabulary/topics/${topic.id}/words`);
    setWords(data);
    try {
      await api.post("/progress/save", {
        user_id: user?.id ?? 1,
        lesson_type: "vocabulary",
        lesson_id: topic.id,
        completed: 1,
        score: 100,
      });
    } catch {}
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="page">
      <h1>Học từ vựng</h1>

      <div className="vocab-search-box">
        <input
          className="vocab-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Tìm từ trong tất cả chủ đề..."
        />
        {searching && <span className="vocab-search-spinner">⏳</span>}
      </div>

      {searchResults.length > 0 && (
        <div className="vocab-search-results">
          <p className="vocab-search-count">Tìm thấy {searchResults.length} từ</p>
          <div className="words-list">
            {searchResults.map((w) => (
              <div key={w.id} className="word-card">
                <div className="word-header">
                  <strong className="word-text">{w.word}</strong>
                  <SpeakButton text={w.word} />
                  <span className="phonetic">{w.phonetic}</span>
                  <span className="pos">{w.part_of_speech}</span>
                  <span className="vocab-topic-tag">{w.topic_name}</span>
                </div>
                <p className="word-meaning">{w.meaning}</p>
                {w.example && <p className="word-example"><SpeakButton text={w.example} /><em>{w.example}</em></p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedTopic && searchResults.length === 0 && (
        <div className="topics-grid">
          {topics.map((t) => (
            <button key={t.id} className="topic-card" onClick={() => selectTopic(t)}>
              <span className="topic-icon">{t.icon}</span>
              <div>
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                <span className="level-badge" style={{ background: levelColors[t.level] }}>
                  {levelLabels[t.level]}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedTopic && (
        <div>
          <button className="back-btn" onClick={() => setSelectedTopic(null)}>
            ← Quay lại
          </button>
          <h2>{selectedTopic.icon} {selectedTopic.name}</h2>
          <div className="words-list">
            {words.map((w) => (
              <div key={w.id} className="word-card">
                <div className="word-header">
                  <strong className="word-text">{w.word}</strong>
                  <SpeakButton text={w.word} />
                  <span className="phonetic">{w.phonetic}</span>
                  <span className="pos">{w.part_of_speech}</span>
                </div>
                <p className="word-meaning">{w.meaning}</p>
                <p className="word-example"><SpeakButton text={w.example} /><em>{w.example}</em></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
