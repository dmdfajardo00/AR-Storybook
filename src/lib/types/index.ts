// User Types
export interface User {
  name: string;
  createdAt: string;
}

// Storybook Page Types
export interface StoryPage {
  id: number;
  title: string;
  description: string;
  explanation: string;
  audioUrl?: string;
  modelUrl?: string;
  imageUrl?: string;
  targetIndex: number;
}

// Quiz Types
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  pageId: number;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  hint?: string;
}

export interface QuizAnswer {
  questionId: number;
  selectedOptionId: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface QuizTake {
  id: number;
  pageId: number;
  completed: boolean;
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  startedAt: string;
  completedAt?: string;
}

// Video Types
export interface Video {
  id: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  category: VideoCategoryType;
}

export type VideoCategoryType = 'carbon-cycle' | 'human-actions' | 'climate-change';

export interface VideoCategory {
  id: VideoCategoryType;
  name: string;
  icon: string;
  description: string;
}

// AR Types
export interface ARState {
  isInitialized: boolean;
  isTracking: boolean;
  detectedPageIndex: number | null;
  overlayVisible: boolean;
  error: string | null;
  permissionDenied: boolean;
}

// Interactive Comic Hotspot Types
export interface ComicHotspot {
  id: string;
  title: string;
  modelUrl: string;
  // Position as percentage of image dimensions (0-100)
  x: number;
  y: number;
  width: number;
  height: number;
}

// App State Types
export type AppMode = 'home' | 'ar' | 'quiz' | 'videos';

export interface AppState {
  currentMode: AppMode;
  isLoading: boolean;
  error: string | null;
}

// Storage Keys
export const STORAGE_KEYS = {
  USER: 'climatales_user',
  QUIZ_TAKES: 'climatales_quiz_takes',
  AR_PREFERENCES: 'climatales_ar_preferences',
} as const;

// Navigation Items
export interface NavItem {
  id: AppMode;
  label: string;
  icon: string;
  path: string;
}
