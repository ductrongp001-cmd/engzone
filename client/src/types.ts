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

export interface AdminTopic extends Topic {
  id: number;
}

export interface AdminGrammarLesson extends GrammarLesson {
  id: number;
}

export interface AdminExercise extends Exercise {
  id: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  level: string;
  created_at: string;
}

export interface IrregularVerb {
  id: number;
  base_form: string;
  past_simple: string;
  past_participle: string;
  meaning: string;
  example: string;
}

export interface AdminStats {
  topics: number;
  words: number;
  grammar: number;
  exercises: number;
  users: number;
}

export interface StressRule {
  id: number;
  title: string;
  description: string;
  rule: string;
  level: string;
  order_index: number;
  examples?: StressExample[];
}

export interface StressExample {
  id: number;
  rule_id: number;
  word: string;
  phonetic: string;
  stressed_part: string;
  explanation: string;
}
