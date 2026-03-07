<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Icon from '@iconify/svelte';
  import { QuizQuestion, QuizResults } from '$lib/components/quiz';
  import { Button } from '$lib/components/ui/button';
  import { getStoryPages, getQuizQuestions } from '$lib/utils/content';
  import { quizStore } from '$lib/stores/quiz.svelte';
  import { progressionStore } from '$lib/stores/progression.svelte';
  import type { StoryPage, QuizQuestion as QuizQuestionType, QuizTake } from '$lib/types';

  // Get page ID from route
  let pageId = $derived(parseInt($page.params.pageId ?? '0'));

  // State
  let storyPage = $state<StoryPage | null>(null);
  let questions = $state<QuizQuestionType[]>([]);
  let currentQuestionIndex = $state(0);
  let selectedOptionId = $state<string | null>(null);
  let showResult = $state(false);
  let quizCompleted = $state(false);
  let isLoading = $state(true);
  let showResumeDialog = $state(false);
  let existingTake = $state<QuizTake | null>(null);

  // Derived
  let currentQuestion = $derived<QuizQuestionType | null>(
    questions.length > 0 ? questions[currentQuestionIndex] ?? null : null
  );
  let isLastQuestion = $derived(currentQuestionIndex >= questions.length - 1);
  let finalScore = $derived(quizStore.currentTake?.score ?? 0);

  onMount(async () => {
    // Load page and questions
    const pages = await getStoryPages();
    storyPage = pages.find(p => p.id === pageId) ?? null;
    questions = await getQuizQuestions(pageId);

    if (!storyPage || questions.length === 0) {
      goto('/quiz');
      return;
    }

    // Block access if page hasn't been viewed in AR
    if (!progressionStore.hasViewedPage(pageId)) {
      goto('/quiz');
      return;
    }

    // Block access to locked pages
    if (!progressionStore.isPageUnlocked(pageId)) {
      goto('/quiz');
      return;
    }

    // Check for existing incomplete take
    existingTake = quizStore.getIncompleteTakeForPage(pageId) ?? null;

    if (existingTake) {
      showResumeDialog = true;
    } else {
      startNewQuiz();
    }

    isLoading = false;
  });

  onDestroy(() => {
    quizStore.endSession();
  });

  function startNewQuiz() {
    quizStore.startTake(pageId, questions.length);
    currentQuestionIndex = 0;
    selectedOptionId = null;
    showResult = false;
    quizCompleted = false;
    showResumeDialog = false;
  }

  function resumeQuiz() {
    if (existingTake) {
      quizStore.resumeTake(existingTake.id);
      currentQuestionIndex = existingTake.currentQuestionIndex;
      selectedOptionId = null;
      showResult = false;
      quizCompleted = false;
      showResumeDialog = false;
    }
  }

  function handleSelect(optionId: string) {
    if (!showResult) {
      selectedOptionId = optionId;
    }
  }

  function handleSubmit() {
    if (!selectedOptionId || !currentQuestion) return;

    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    quizStore.answerQuestion(currentQuestion.id, selectedOptionId, isCorrect);
    showResult = true;
  }

  function handleNext() {
    if (isLastQuestion) {
      quizStore.completeTake();
      quizCompleted = true;
    } else {
      currentQuestionIndex += 1;
      selectedOptionId = null;
      showResult = false;
    }
  }

  function handleRetry() {
    selectedOptionId = null;
    showResult = false;
  }

  function handleRetake() {
    startNewQuiz();
  }

  function handleBack() {
    goto('/quiz');
  }
</script>

<svelte:head>
  <title>{storyPage?.title ?? 'Quiz'} - ClimaTales AR</title>
</svelte:head>

<div class="min-h-screen min-h-dvh pb-nav bg-gradient-to-br from-canopy-50 via-mist to-ocean-50 flex flex-col">
  {#if isLoading}
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto rounded-full border-4 border-canopy-200 border-t-canopy-500 animate-spin mb-4"></div>
        <p class="font-body text-canopy-600">Loading quiz...</p>
      </div>
    </div>
  {:else if showResumeDialog}
    <!-- Resume dialog -->
    <div class="flex-1 flex items-center justify-center px-6">
      <div class="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-canopy-100">
        <div class="text-center mb-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-ocean-400 to-canopy-400 flex items-center justify-center">
            <Icon icon="solar:history-bold-duotone" class="w-8 h-8 text-white" />
          </div>
          <h2 class="font-display text-xl font-bold text-canopy-900 mb-2">Continue Your Quiz?</h2>
          <p class="font-body text-canopy-600">
            You have an unfinished quiz for "{storyPage?.title}".
            Would you like to continue where you left off?
          </p>
        </div>

        {#if existingTake}
          <div class="bg-canopy-50 rounded-xl p-4 mb-6">
            <div class="flex items-center justify-between text-sm">
              <span class="font-body text-canopy-600">Progress</span>
              <span class="font-accent font-semibold text-canopy-800">
                Question {existingTake.currentQuestionIndex + 1} of {existingTake.totalQuestions}
              </span>
            </div>
            <div class="mt-2 h-2 bg-canopy-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-canopy-400 to-ocean-400 rounded-full"
                style="width: {(existingTake.currentQuestionIndex / existingTake.totalQuestions) * 100}%"
              ></div>
            </div>
          </div>
        {/if}

        <div class="space-y-3">
          <Button onclick={resumeQuiz} class="w-full" size="lg">
            <Icon icon="solar:play-bold" class="w-5 h-5" />
            Continue Quiz
          </Button>
          <Button onclick={startNewQuiz} variant="secondary" class="w-full" size="lg">
            <Icon icon="solar:refresh-bold" class="w-5 h-5" />
            Start Over
          </Button>
          <button
            onclick={handleBack}
            class="w-full text-center text-canopy-500 font-body text-sm hover:text-canopy-700 transition-colors py-2 touch-manipulation"
          >
            Back to All Quizzes
          </button>
        </div>
      </div>
    </div>
  {:else if quizCompleted}
    <!-- Results -->
    <QuizResults
      score={finalScore}
      totalQuestions={questions.length}
      {pageId}
      pageTitle={storyPage?.title ?? 'Quiz'}
      onRetake={handleRetake}
    />
  {:else}
    <!-- Quiz header -->
    <div class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-canopy-100 safe-top">
      <div class="px-4 py-3 flex items-center gap-3">
        <button
          onclick={handleBack}
          class="w-10 h-10 rounded-full bg-canopy-100 hover:bg-canopy-200 flex items-center justify-center transition-colors touch-manipulation"
        >
          <Icon icon="solar:alt-arrow-left-linear" class="w-5 h-5 text-canopy-700" />
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="font-accent font-semibold text-canopy-800 truncate">
            {storyPage?.title}
          </h1>
          <p class="font-body text-xs text-canopy-500">Page {pageId} Quiz</p>
        </div>
        <div class="shrink-0 text-right">
          <span class="font-display text-lg font-bold text-canopy-700">
            {currentQuestionIndex + 1}
          </span>
          <span class="font-body text-sm text-canopy-400">/{questions.length}</span>
        </div>
      </div>
    </div>

    <!-- Question content -->
    <div class="flex-1 px-4 py-6">
      {#if currentQuestion}
        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          {selectedOptionId}
          {showResult}
          onSelect={handleSelect}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onRetry={handleRetry}
        />
      {/if}
    </div>
  {/if}
</div>
