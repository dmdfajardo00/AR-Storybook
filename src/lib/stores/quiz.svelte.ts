import { quizStorage } from '$lib/utils/storage';
import type { QuizTake, QuizAnswer } from '$lib/types';

function createQuizStore() {
  let takes = $state<QuizTake[]>([]);
  let currentTake = $state<QuizTake | null>(null);
  let isLoaded = $state(false);

  // Derived state
  const hasTakes = $derived(takes.length > 0);
  const completedTakes = $derived(takes.filter((t) => t.completed));
  const incompleteTakes = $derived(takes.filter((t) => !t.completed));
  const isInProgress = $derived(currentTake !== null && !currentTake.completed);

  // Load takes from storage
  function load() {
    if (typeof window !== 'undefined') {
      takes = quizStorage.getTakes();
      isLoaded = true;
    }
  }

  // Start a new quiz take
  function startTake(pageId: number, totalQuestions: number): QuizTake {
    const newTake: QuizTake = {
      id: quizStorage.getNextTakeId(),
      pageId,
      completed: false,
      currentQuestionIndex: 0,
      answers: [],
      score: 0,
      totalQuestions,
      startedAt: new Date().toISOString(),
    };

    currentTake = newTake;
    takes = [...takes, newTake];
    quizStorage.addTake(newTake);

    return newTake;
  }

  // Resume an incomplete take
  function resumeTake(takeId: number): QuizTake | null {
    const take = takes.find((t) => t.id === takeId);
    if (take && !take.completed) {
      currentTake = take;
      return take;
    }
    return null;
  }

  // Answer a question
  function answerQuestion(questionId: number, selectedOptionId: string, isCorrect: boolean) {
    if (!currentTake) return;

    const answer: QuizAnswer = {
      questionId,
      selectedOptionId,
      isCorrect,
      answeredAt: new Date().toISOString(),
    };

    // Update the current take
    currentTake.answers = [...currentTake.answers, answer];
    if (isCorrect) {
      currentTake.score += 1;
    }
    currentTake.currentQuestionIndex += 1;

    // Update the takes array and storage
    takes = takes.map((t) => (t.id === currentTake!.id ? currentTake! : t));
    quizStorage.updateTake(currentTake);
  }

  // Complete the current take
  function completeTake() {
    if (!currentTake) return;

    currentTake.completed = true;
    currentTake.completedAt = new Date().toISOString();

    // Update the takes array and storage
    takes = takes.map((t) => (t.id === currentTake!.id ? currentTake! : t));
    quizStorage.updateTake(currentTake);
  }

  // End/cancel the current take session (without marking complete)
  function endSession() {
    currentTake = null;
  }

  // Get takes for a specific page
  function getTakesByPage(pageId: number): QuizTake[] {
    return takes.filter((t) => t.pageId === pageId);
  }

  // Get incomplete take for a page (for resume functionality)
  function getIncompleteTakeForPage(pageId: number): QuizTake | undefined {
    return takes.find((t) => t.pageId === pageId && !t.completed);
  }

  // Get best score for a page
  function getBestScoreForPage(pageId: number): number {
    const pageTakes = getTakesByPage(pageId).filter((t) => t.completed);
    if (pageTakes.length === 0) return 0;
    return Math.max(...pageTakes.map((t) => t.score));
  }

  // Clear all takes
  function clearAll() {
    takes = [];
    currentTake = null;
    quizStorage.clearAll();
  }

  return {
    get takes() {
      return takes;
    },
    get currentTake() {
      return currentTake;
    },
    get hasTakes() {
      return hasTakes;
    },
    get completedTakes() {
      return completedTakes;
    },
    get incompleteTakes() {
      return incompleteTakes;
    },
    get isInProgress() {
      return isInProgress;
    },
    get isLoaded() {
      return isLoaded;
    },
    load,
    startTake,
    resumeTake,
    answerQuestion,
    completeTake,
    endSession,
    getTakesByPage,
    getIncompleteTakeForPage,
    getBestScoreForPage,
    clearAll,
  };
}

export const quizStore = createQuizStore();
