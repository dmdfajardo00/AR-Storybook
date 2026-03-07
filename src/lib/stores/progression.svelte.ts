import { STORAGE_KEYS } from '$lib/types';
import { env } from '$env/dynamic/public';

interface ProgressionData {
  unlockedPages: number[];
  viewedPages: number[];
}

const PASSING_SCORE = 3;
const ALL_PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function isTestingMode(): boolean {
  try {
    return env.PUBLIC_TESTING_MODE === 'true';
  } catch {
    return false;
  }
}

function createProgressionStore() {
  let unlockedPages = $state<number[]>([1, 2]); // Page 1 always open, page 1->2 has no gate
  let viewedPages = $state<number[]>([1]); // Page 1 always counts as viewed (intro page)
  let isLoaded = $state(false);

  function load() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROGRESSION);
      if (raw) {
        const data: ProgressionData = JSON.parse(raw);
        // Always ensure pages 1 and 2 are unlocked
        const pages = new Set([1, 2, ...data.unlockedPages]);
        unlockedPages = [...pages].sort((a, b) => a - b);
        // Always ensure page 1 is viewed (intro page)
        const viewed = new Set([1, ...(data.viewedPages || [])]);
        viewedPages = [...viewed].sort((a, b) => a - b);
      }
    } catch {
      // Use defaults
    }
    isLoaded = true;
  }

  function save() {
    if (typeof window === 'undefined') return;
    try {
      const data: ProgressionData = { unlockedPages, viewedPages };
      localStorage.setItem(STORAGE_KEYS.PROGRESSION, JSON.stringify(data));
    } catch {
      // Storage full or unavailable
    }
  }

  function isPageUnlocked(pageId: number): boolean {
    if (isTestingMode()) return true;
    return unlockedPages.includes(pageId);
  }

  /**
   * Attempt to unlock the next page after completing a quiz.
   * Returns the newly unlocked pageId, or null if already unlocked or score too low.
   */
  function tryUnlockNext(completedPageId: number, score: number): number | null {
    if (score < PASSING_SCORE) return null;

    const nextPageId = completedPageId + 1;
    if (nextPageId > 11) return null; // No page after 11
    if (unlockedPages.includes(nextPageId)) return null; // Already unlocked

    unlockedPages = [...unlockedPages, nextPageId].sort((a, b) => a - b);
    save();
    return nextPageId;
  }

  function getNextLockedPage(currentPageId: number): number | null {
    const nextPageId = currentPageId + 1;
    if (nextPageId > 11) return null;
    if (unlockedPages.includes(nextPageId)) return null;
    return nextPageId;
  }

  function markPageViewed(pageId: number) {
    if (viewedPages.includes(pageId)) return;
    viewedPages = [...viewedPages, pageId].sort((a, b) => a - b);
    save();
  }

  function hasViewedPage(pageId: number): boolean {
    if (isTestingMode()) return true;
    return viewedPages.includes(pageId);
  }

  function reset() {
    unlockedPages = [1, 2];
    viewedPages = [1];
    save();
  }

  return {
    get unlockedPages() { return unlockedPages; },
    get viewedPages() { return viewedPages; },
    get isLoaded() { return isLoaded; },
    get passingScore() { return PASSING_SCORE; },
    load,
    isPageUnlocked,
    markPageViewed,
    hasViewedPage,
    tryUnlockNext,
    getNextLockedPage,
    reset,
  };
}

export const progressionStore = createProgressionStore();
