import { useCallback } from "react";

export default function SpeakButton({ text, lang = "en-US" }: { text: string; lang?: string }) {
  const speak = useCallback(() => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find((v) => v.lang.startsWith("en"));
    if (enVoice) utterance.voice = enVoice;
    window.speechSynthesis.speak(utterance);
  }, [text, lang]);

  return (
    <button className="speak-btn" onClick={(e) => { e.stopPropagation(); speak(); }} title="Phát âm">
      🔊
    </button>
  );
}
