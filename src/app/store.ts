import { create } from 'zustand';

export interface User {
  id: number;
  name: string;
  age: number;
  avatar: string;
}

export interface WritingTask {
  id: number;
  letter: string;
  level: string;
  word: string;
  emoji: string;
  color: string;
  instruction: string;
  audio_path: string;
  order_index: number;
}

export interface WritingProgress {
  id: number;
  user_id: number;
  task_id: number;
  attempts_count: number;
  completed: number; // 0 | 1 (SQLite stores as int)
  completed_at: string | null;
}

export interface MatchLetterRound {
  id: number;
  level: number;
  pairs: string; // JSON: [['A','a'], ...]
  order_index: number;
}

export interface MatchLetterProgress {
  id: number;
  user_id: number;
  round_id: number;
  attempts_count: number;
  completed: number; // 0 | 1
  completed_at: string | null;
}

export interface MatchWordRound {
  id: number;
  level: number;
  pairs: string; // JSON: [{ word, animal }]
  order_index: number;
}

export interface MatchWordProgress {
  id: number;
  user_id: number;
  round_id: number;
  attempts_count: number;
  completed: number; // 0 | 1
  completed_at: string | null;
}

interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  setUsers: (users: User[]) => void;

  writingTasks: WritingTask[];
  setWritingTasks: (tasks: WritingTask[]) => void;
  writingProgress: WritingProgress[];
  setWritingProgress: (progress: WritingProgress[]) => void;

  matchLetterRounds: MatchLetterRound[];
  setMatchLetterRounds: (rounds: MatchLetterRound[]) => void;
  matchLetterProgress: MatchLetterProgress[];
  setMatchLetterProgress: (progress: MatchLetterProgress[]) => void;

  matchWordRounds: MatchWordRound[];
  setMatchWordRounds: (rounds: MatchWordRound[]) => void;
  matchWordProgress: MatchWordProgress[];
  setMatchWordProgress: (progress: MatchWordProgress[]) => void;
}

const useAppStore = create<AppState>()((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  users: [],
  setUsers: (users) => set({ users }),

  writingTasks: [],
  setWritingTasks: (tasks) => set({ writingTasks: tasks }),
  writingProgress: [],
  setWritingProgress: (progress) => set({ writingProgress: progress }),

  matchLetterRounds: [],
  setMatchLetterRounds: (rounds) => set({ matchLetterRounds: rounds }),
  matchLetterProgress: [],
  setMatchLetterProgress: (progress) => set({ matchLetterProgress: progress }),

  matchWordRounds: [],
  setMatchWordRounds: (rounds) => set({ matchWordRounds: rounds }),
  matchWordProgress: [],
  setMatchWordProgress: (progress) => set({ matchWordProgress: progress }),
}));

export { useAppStore };
