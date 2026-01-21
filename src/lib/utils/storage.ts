import { STORAGE_KEYS, type User, type QuizTake } from '$lib/types';

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const hasStorage = typeof window !== 'undefined' && isLocalStorageAvailable();

// Generic storage helpers
function getItem<T>(key: string): T | null {
  if (!hasStorage) return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
}

function setItem<T>(key: string, value: T): boolean {
  if (!hasStorage) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
}

function removeItem(key: string): boolean {
  if (!hasStorage) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

// User Storage
export const userStorage = {
  get: (): User | null => getItem<User>(STORAGE_KEYS.USER),

  set: (user: User): boolean => setItem(STORAGE_KEYS.USER, user),

  setName: (name: string): boolean => {
    const existing = userStorage.get();
    return setItem(STORAGE_KEYS.USER, {
      name,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
  },

  clear: (): boolean => removeItem(STORAGE_KEYS.USER),
};

// Quiz Storage
export const quizStorage = {
  getTakes: (): QuizTake[] => getItem<QuizTake[]>(STORAGE_KEYS.QUIZ_TAKES) ?? [],

  saveTakes: (takes: QuizTake[]): boolean => setItem(STORAGE_KEYS.QUIZ_TAKES, takes),

  addTake: (take: QuizTake): boolean => {
    const takes = quizStorage.getTakes();
    takes.push(take);
    return quizStorage.saveTakes(takes);
  },

  updateTake: (updatedTake: QuizTake): boolean => {
    const takes = quizStorage.getTakes();
    const index = takes.findIndex((t) => t.id === updatedTake.id);
    if (index !== -1) {
      takes[index] = updatedTake;
      return quizStorage.saveTakes(takes);
    }
    return false;
  },

  getTakesByPage: (pageId: number): QuizTake[] => {
    return quizStorage.getTakes().filter((t) => t.pageId === pageId);
  },

  getIncompleteTake: (pageId: number): QuizTake | undefined => {
    return quizStorage.getTakes().find((t) => t.pageId === pageId && !t.completed);
  },

  getNextTakeId: (): number => {
    const takes = quizStorage.getTakes();
    return takes.length > 0 ? Math.max(...takes.map((t) => t.id)) + 1 : 1;
  },

  clearAll: (): boolean => removeItem(STORAGE_KEYS.QUIZ_TAKES),
};

// General storage utilities
export const storage = {
  user: userStorage,
  quiz: quizStorage,
  clear: (): void => {
    Object.values(STORAGE_KEYS).forEach((key) => removeItem(key));
  },
};
