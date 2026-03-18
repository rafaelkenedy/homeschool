import { create } from 'zustand';

export interface User {
  id: number;
  name: string;
  age: number;
  avatar: string;
}

interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  users: [],
  setUsers: (users) => set({ users }),
}));
