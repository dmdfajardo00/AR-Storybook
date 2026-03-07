<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { getStoryPages, getQuizQuestions } from '$lib/utils/content';
  import { quizStore } from '$lib/stores/quiz.svelte';
  import { progressionStore } from '$lib/stores/progression.svelte';
  import { calculateScorePercentage, sfx } from '$lib/utils';
  import type { StoryPage } from '$lib/types';

  interface PageWithQuizInfo extends StoryPage {
    questionCount: number;
    bestScore: number | null;
    hasIncomplete: boolean;
    isLocked: boolean;
    needsAR: boolean;
  }

  let pages = $state<PageWithQuizInfo[]>([]);
  let isLoading = $state(true);

  onMount(async () => {
    const storyPages = await getStoryPages();
    const pagesWithInfo: PageWithQuizInfo[] = [];

    for (const page of storyPages) {
      const questions = await getQuizQuestions(page.id);
      const incompleteTake = quizStore.getIncompleteTakeForPage(page.id);
      const bestScore = quizStore.getBestScoreForPage(page.id);

      pagesWithInfo.push({
        ...page,
        questionCount: questions.length,
        bestScore: questions.length > 0 && bestScore > 0 ? bestScore : null,
        hasIncomplete: incompleteTake !== undefined,
        isLocked: !progressionStore.isPageUnlocked(page.id),
        needsAR: !progressionStore.hasViewedPage(page.id),
      });
    }

    pages = pagesWithInfo.filter(p => p.questionCount > 0);
    isLoading = false;
  });

  function handleStartQuiz(pageId: number) {
    sfx.tap();
    goto(`/quiz/${pageId}`);
  }

  function getRequiredPage(pageId: number): number {
    return pageId - 1;
  }
</script>

<svelte:head>
  <title>Quiz Mode - ClimaTales AR</title>
  <meta name="description" content="Test your climate knowledge with fun quizzes" />
</svelte:head>

<div class="min-h-screen min-h-dvh pb-nav bg-gradient-to-br from-ocean-50 via-mist to-canopy-50">
  <!-- Header -->
  <div class="sticky top-0 z-20 bg-gradient-to-r from-ocean-500 to-canopy-500 text-white px-6 py-5 shadow-lg safe-top">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon icon="solar:clipboard-check-bold-duotone" class="w-7 h-7" />
        </div>
        <div>
          <h1 class="font-display text-2xl font-bold">Quiz Mode</h1>
          <p class="font-body text-sm text-white/80">Test your climate knowledge</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-4 py-6 max-w-lg mx-auto">
    {#if isLoading}
      <div class="flex flex-col items-center justify-center py-16">
        <div class="w-16 h-16 rounded-full border-4 border-canopy-200 border-t-canopy-500 animate-spin mb-4"></div>
        <p class="font-body text-canopy-600">Loading quizzes...</p>
      </div>
    {:else if pages.length === 0}
      <div class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-canopy-100 flex items-center justify-center">
          <Icon icon="solar:clipboard-remove-bold-duotone" class="w-10 h-10 text-canopy-400" />
        </div>
        <h2 class="font-display text-xl font-semibold text-canopy-800 mb-2">No Quizzes Yet</h2>
        <p class="font-body text-canopy-600 mb-6">Scan storybook pages in AR Mode to unlock quizzes!</p>
        <Button onclick={() => goto('/ar')}>
          <Icon icon="solar:camera-bold" class="w-5 h-5" />
          Go to AR Mode
        </Button>
      </div>
    {:else}
      <!-- Incomplete quizzes section -->
      {#if pages.some(p => p.hasIncomplete && !p.isLocked && !p.needsAR)}
        <div class="mb-6">
          <h2 class="font-accent font-semibold text-canopy-700 mb-3 flex items-center gap-2">
            <Icon icon="solar:play-circle-bold" class="w-5 h-5 text-ocean-500" />
            Continue Where You Left Off
          </h2>
          <div class="space-y-3">
            {#each pages.filter(p => p.hasIncomplete && !p.isLocked && !p.needsAR) as page}
              <button
                onclick={() => handleStartQuiz(page.id)}
                class="w-full bg-gradient-to-r from-ocean-50 to-canopy-50 border-2 border-ocean-200 rounded-xl p-4 text-left transition-all duration-300 hover:shadow-md hover:border-ocean-300 active:scale-[0.99] touch-manipulation"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean-400 to-canopy-400 flex items-center justify-center text-white font-display font-bold text-lg shadow-md">
                    {page.id}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="font-accent font-semibold text-canopy-800 truncate">{page.title}</h3>
                      <Badge variant="warning" class="shrink-0">In Progress</Badge>
                    </div>
                    <p class="font-body text-sm text-canopy-600">{page.questionCount} questions</p>
                  </div>
                  <Icon icon="solar:alt-arrow-right-linear" class="w-5 h-5 text-canopy-400 shrink-0" />
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- All quizzes -->
      <div>
        <h2 class="font-accent font-semibold text-canopy-700 mb-3 flex items-center gap-2">
          <Icon icon="solar:clipboard-list-bold" class="w-5 h-5 text-canopy-500" />
          All Quizzes
        </h2>
        <div class="space-y-3">
          {#each pages as page}
            {#if page.needsAR}
              <!-- Needs AR viewing first -->
              <div
                class="w-full bg-ocean-50 rounded-xl p-4 text-left border border-ocean-200 opacity-85"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-ocean-100 flex items-center justify-center text-ocean-400 font-display font-bold text-lg">
                    <Icon icon="solar:camera-bold" class="w-6 h-6" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-accent font-semibold text-ocean-700 truncate mb-1">{page.title}</h3>
                    <p class="font-body text-sm text-ocean-500">
                      Scan in AR Mode first
                    </p>
                  </div>
                  <Icon icon="solar:camera-bold" class="w-5 h-5 text-ocean-300 shrink-0" />
                </div>
              </div>
            {:else if page.isLocked}
              <!-- Locked page -->
              <div
                class="w-full bg-gray-50 rounded-xl p-4 text-left border border-gray-200 opacity-75"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 font-display font-bold text-lg">
                    <Icon icon="solar:lock-bold" class="w-6 h-6" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-accent font-semibold text-gray-500 truncate mb-1">{page.title}</h3>
                    <p class="font-body text-sm text-gray-400">
                      Score {progressionStore.passingScore}+ on Page {getRequiredPage(page.id)} quiz to unlock
                    </p>
                  </div>
                  <Icon icon="solar:lock-bold" class="w-5 h-5 text-gray-300 shrink-0" />
                </div>
              </div>
            {:else}
              <!-- Unlocked page -->
              <button
                onclick={() => handleStartQuiz(page.id)}
                class="w-full bg-white rounded-xl p-4 text-left shadow-sm border border-canopy-100 transition-all duration-300 hover:shadow-md hover:border-canopy-200 active:scale-[0.99] touch-manipulation"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-canopy-100 to-ocean-100 flex items-center justify-center text-canopy-700 font-display font-bold text-lg">
                    {page.id}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-accent font-semibold text-canopy-800 truncate mb-1">{page.title}</h3>
                    <div class="flex items-center gap-3">
                      <span class="font-body text-sm text-canopy-500 flex items-center gap-1">
                        <Icon icon="solar:question-circle-linear" class="w-4 h-4" />
                        {page.questionCount} questions
                      </span>
                      {#if page.bestScore !== null}
                        <span class="font-body text-sm flex items-center gap-1" class:text-canopy-500={page.bestScore >= progressionStore.passingScore} class:text-coral-500={page.bestScore < progressionStore.passingScore}>
                          <Icon icon="solar:medal-star-bold" class="w-4 h-4" />
                          Best: {page.bestScore}/{page.questionCount}
                        </span>
                      {/if}
                    </div>
                  </div>
                  <div class="shrink-0">
                    {#if page.bestScore !== null && page.bestScore >= progressionStore.passingScore}
                      <div class="w-8 h-8 rounded-full bg-canopy-100 flex items-center justify-center">
                        <Icon icon="solar:check-circle-bold" class="w-5 h-5 text-canopy-500" />
                      </div>
                    {:else}
                      <Icon icon="solar:alt-arrow-right-linear" class="w-5 h-5 text-canopy-400" />
                    {/if}
                  </div>
                </div>
              </button>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
