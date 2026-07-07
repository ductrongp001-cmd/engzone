import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import type { Topic, Word } from "../types";

export default function Flashcard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [cards, setCards] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"select" | "study" | "done">("select");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Topic[]>("/vocabulary/topics").then((data) => {
      setTopics(data);
      setLoading(false);
    });
  }, []);

  const toggleTopic = (id: number) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const startStudy = useCallback(async () => {
    const ids = selectedTopicIds.length > 0 ? selectedTopicIds : topics.map((t) => t.id);
    const params = "?topicIds=" + ids.join(",") + "&limit=30";
    const data = await api.get<Word[]>("/vocabulary/words" + params);
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }
    setCards(data);
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setPhase("study");
  }, [selectedTopicIds, topics]);

  const nextCard = (gotIt: boolean) => {
    if (gotIt) {
      setKnown((prev) => new Set(prev).add(cards[index].id));
    }
    if (index < cards.length - 1) {
      setIndex((i) => i + 1);
      setFlipped(false);
    } else {
      setPhase("done");
    }
  };

  const restart = () => {
    setPhase("select");
    setCards([]);
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
  };

  if (loading) {
    return <div className="page"><h1>Thẻ ghi nhớ</h1><p>Đang tải...</p></div>;
  }

  if (phase === "done") {
    return (
      <div className="page flashcard-page">
        <h1>Thẻ ghi nhớ</h1>
        <div className="flashcard-done">
          <h2>Hoàn thành!</h2>
          <p>Đã ôn {cards.length} từ</p>
          <p>Đã nhớ: <strong>{known.size}</strong> từ</p>
          <p>Cần ôn lại: <strong>{cards.length - known.size}</strong> từ</p>
          <div className="flashcard-progress-bar">
            <div className="flashcard-progress-fill" style={{ width: `${(known.size / cards.length) * 100}%` }} />
          </div>
          <button className="flashcard-btn" onClick={restart}>Học tiếp</button>
        </div>
      </div>
    );
  }

  if (phase === "study") {
    const card = cards[index];
    return (
      <div className="page flashcard-page">
        <div className="flashcard-header">
          <h1>Thẻ ghi nhớ</h1>
          <span className="flashcard-counter">{index + 1} / {cards.length}</span>
        </div>
        <div className="flashcard-progress-bar">
          <div className="flashcard-progress-fill" style={{ width: `${((index + 1) / cards.length) * 100}%` }} />
        </div>
        <div className={`flashcard-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div className="flashcard-word">{card.word}</div>
              {card.phonetic && <div className="flashcard-phonetic">{card.phonetic}</div>}
              {card.part_of_speech && <span className="flashcard-pos">{card.part_of_speech}</span>}
              <div className="flashcard-hint">Nhấn để lật thẻ</div>
            </div>
            <div className="flashcard-back">
              <div className="flashcard-meaning">{card.meaning}</div>
              {card.example && <div className="flashcard-example">{card.example}</div>}
              <div className="flashcard-hint">Nhấn để lật lại</div>
            </div>
          </div>
        </div>
        <div className="flashcard-actions">
          <button className="flashcard-btn no" onClick={() => nextCard(false)}>Chưa thuộc</button>
          <button className="flashcard-btn yes" onClick={() => nextCard(true)}>Đã thuộc</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page flashcard-page">
      <h1>Thẻ ghi nhớ</h1>
      <p className="flashcard-desc">Chọn chủ đề để ôn tập</p>
      <div className="flashcard-topics">
        {topics.map((topic) => (
          <button
            key={topic.id}
            className={`flashcard-topic-btn ${selectedTopicIds.includes(topic.id) ? "selected" : ""}`}
            onClick={() => toggleTopic(topic.id)}
          >
            {topic.icon} {topic.name}
          </button>
        ))}
      </div>
      <button
        className="flashcard-btn start"
        onClick={startStudy}
        disabled={selectedTopicIds.length === 0 && topics.length > 0}
      >
        Bắt đầu ôn tập
      </button>
    </div>
  );
}
