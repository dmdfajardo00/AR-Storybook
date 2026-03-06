<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';
  import { Button } from '$lib/components/ui/button';
  import { getScoreMessage, calculateScorePercentage, sfx, getYouTubeId, openYouTube } from '$lib/utils';
  import { getVideosForPage } from '$lib/utils/content';
  import { progressionStore } from '$lib/stores/progression.svelte';
  import confetti from 'canvas-confetti';
  import type { Video } from '$lib/types';

  interface Props {
    score: number;
    totalQuestions: number;
    pageId: number;
    pageTitle: string;
    onRetake?: () => void;
  }

  let { score, totalQuestions, pageId, pageTitle, onRetake }: Props = $props();

  const percentage = $derived(calculateScorePercentage(score, totalQuestions));
  const scoreMessage = $derived(getScoreMessage(percentage));
  const isPerfect = $derived(score === totalQuestions);
  const didPass = $derived(score >= progressionStore.passingScore);

  let unlockedPageId = $state<number | null>(null);
  let pageVideos = $state<Video[]>([]);

  onMount(async () => {
    sfx.celebrate();

    // Try to unlock next page
    unlockedPageId = progressionStore.tryUnlockNext(pageId, score);

    if (isPerfect || didPass) {
      confetti({
        particleCount: isPerfect ? 150 : 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22A652', '#00A3E0', '#FFD93D', '#FF6B6B']
      });
    }

    // Load videos for this page
    pageVideos = await getVideosForPage(pageId);
  });

  function handleContinue() {
    goto('/quiz');
  }

  function handleBackToAR() {
    goto('/ar');
  }

  function getYouTubeThumbnail(url: string): string {
    const videoId = getYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  }
</script>

<div class="min-h-full flex flex-col items-center justify-center px-6 py-8">
  <!-- Score circle -->
  <div class="relative mb-6">
    <div
      class="w-36 h-36 rounded-full flex items-center justify-center shadow-xl"
      class:bg-gradient-to-br={true}
      class:from-canopy-400={didPass}
      class:to-ocean-500={didPass}
      class:from-coral-400={!didPass}
      class:to-orange-500={!didPass}
    >
      <div class="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
        <span class="font-display text-3xl font-bold" class:text-canopy-600={didPass} class:text-coral-600={!didPass}>
          {score}
        </span>
        <span class="font-body text-sm text-gray-500">out of {totalQuestions}</span>
      </div>
    </div>

    {#if isPerfect}
      <div class="absolute -top-2 -right-2 animate-bounce">
        <Icon icon="solar:star-bold" class="w-10 h-10 text-warning drop-shadow-lg" />
      </div>
      <div class="absolute -bottom-1 -left-3 animate-bounce" style="animation-delay: 0.2s;">
        <Icon icon="solar:star-bold" class="w-8 h-8 text-warning drop-shadow-lg" />
      </div>
    {/if}
  </div>

  <!-- Message -->
  <div class="text-center mb-6">
    <h2 class="font-display text-2xl md:text-3xl font-bold text-canopy-900 mb-2">
      {#if isPerfect}
        Perfect Score!
      {:else if didPass}
        Well Done!
      {:else}
        Keep Learning!
      {/if}
    </h2>
    <p class="font-body text-canopy-600 text-lg">{scoreMessage.message}</p>
    <p class="font-accent text-sm text-canopy-500 mt-2">
      Quiz: {pageTitle}
    </p>
  </div>

  <!-- Unlock notification -->
  {#if unlockedPageId}
    <div class="w-full max-w-sm bg-gradient-to-r from-canopy-50 to-ocean-50 border-2 border-canopy-200 rounded-2xl p-4 mb-6 animate-fadeIn">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-canopy-500 flex items-center justify-center shrink-0">
          <Icon icon="solar:lock-open-bold" class="w-5 h-5 text-white" />
        </div>
        <div>
          <p class="font-accent font-semibold text-canopy-800">Page {unlockedPageId} Unlocked!</p>
          <p class="font-body text-sm text-canopy-600">You can now take the next quiz.</p>
        </div>
      </div>
    </div>
  {:else if !didPass}
    <div class="w-full max-w-sm bg-coral-50 border border-coral-200 rounded-2xl p-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-coral-100 flex items-center justify-center shrink-0">
          <Icon icon="solar:lock-bold" class="w-5 h-5 text-coral-500" />
        </div>
        <div>
          <p class="font-accent font-semibold text-coral-800">Score {progressionStore.passingScore}+ to unlock next page</p>
          <p class="font-body text-sm text-coral-600">Try again — you're almost there!</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Score breakdown -->
  <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-5 mb-6 border border-canopy-100">
    <h3 class="font-accent font-semibold text-canopy-800 mb-3 flex items-center gap-2">
      <Icon icon="solar:chart-2-bold-duotone" class="w-5 h-5 text-canopy-500" />
      Your Performance
    </h3>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-canopy-100 flex items-center justify-center">
            <Icon icon="solar:check-circle-bold" class="w-5 h-5 text-canopy-500" />
          </div>
          <span class="font-body text-canopy-700">Correct</span>
        </div>
        <span class="font-display font-bold text-canopy-600">{score}</span>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center">
            <Icon icon="solar:close-circle-bold" class="w-5 h-5 text-coral-500" />
          </div>
          <span class="font-body text-canopy-700">Incorrect</span>
        </div>
        <span class="font-display font-bold text-coral-600">{totalQuestions - score}</span>
      </div>

      <div class="pt-2">
        <div class="flex items-center justify-between mb-1">
          <span class="font-accent text-xs text-canopy-500">Accuracy</span>
          <span class="font-accent text-xs font-semibold" class:text-canopy-600={didPass} class:text-coral-600={!didPass}>
            {percentage}%
          </span>
        </div>
        <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-1000 ease-out"
            class:bg-gradient-to-r={true}
            class:from-canopy-400={didPass}
            class:to-ocean-400={didPass}
            class:from-coral-400={!didPass}
            class:to-orange-400={!didPass}
            style="width: {percentage}%"
          ></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Supplementary Videos -->
  {#if pageVideos.length > 0}
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-5 mb-6 border border-canopy-100">
      <h3 class="font-accent font-semibold text-canopy-800 mb-3 flex items-center gap-2">
        <Icon icon="solar:play-circle-bold-duotone" class="w-5 h-5 text-ocean-500" />
        Learn More (Optional)
      </h3>
      <p class="font-body text-sm text-canopy-500 mb-3">Watch these videos to deepen your understanding.</p>
      <div class="space-y-3">
        {#each pageVideos as video (video.id)}
          <button
            onclick={() => openYouTube(video.youtubeUrl)}
            class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-canopy-50 transition-colors touch-manipulation text-left"
          >
            <div class="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {#if getYouTubeThumbnail(video.youtubeUrl)}
                <img
                  src={getYouTubeThumbnail(video.youtubeUrl)}
                  alt={video.title}
                  class="w-full h-full object-cover"
                />
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-accent text-sm font-medium text-canopy-800 truncate">{video.title}</p>
              <p class="font-body text-xs text-canopy-500 flex items-center gap-1">
                <Icon icon="mdi:youtube" class="w-3 h-3 text-red-500" />
                YouTube
              </p>
            </div>
            <Icon icon="solar:arrow-right-up-linear" class="w-4 h-4 text-canopy-400 shrink-0" />
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Action buttons -->
  <div class="w-full max-w-sm space-y-3">
    {#if !didPass}
      <Button onclick={onRetake} class="w-full" size="lg">
        <Icon icon="solar:refresh-bold" class="w-5 h-5" />
        Try Again
      </Button>
    {/if}

    <Button onclick={handleContinue} variant={didPass ? 'default' : 'secondary'} class="w-full" size="lg">
      <Icon icon="solar:clipboard-list-bold" class="w-5 h-5" />
      All Quizzes
    </Button>

    <Button onclick={handleBackToAR} variant="ghost" class="w-full">
      <Icon icon="solar:camera-bold" class="w-5 h-5" />
      Back to AR Mode
    </Button>
  </div>
</div>
