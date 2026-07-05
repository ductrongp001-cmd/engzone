export interface Topic {
  id: number;
  name: string;
  description: string;
  level: string;
  icon: string;
  order_index: number;
}

export interface Word {
  id: number;
  topic_id: number;
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
  part_of_speech: string;
}

export interface GrammarLesson {
  id: number;
  title: string;
  content: string;
  level: string;
  category: string;
  order_index: number;
  examples?: GrammarExample[];
}

export interface GrammarExample {
  id: number;
  lesson_id: number;
  sentence: string;
  translation: string;
  explanation: string;
}

export interface Exercise {
  id: number;
  lesson_type: string;
  lesson_id: number | null;
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  difficulty: string;
}
