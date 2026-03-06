<script lang="ts">
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';
  import { Button } from '$lib/components/ui/button';
  import { getScoreMessage, calculateScorePercentage, sfx } from '$lib/utils';
  import confetti from 'canvas-confetti';
  import { onMount } from 'svelte';

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
  const isPassing = $derived(percentage >= 70);

  onMount(() => {
    sfx.celebrate();
    if (isPerfect || isPassing) {
      // Trigger confetti for good scores
      confetti({
        particleCount: isPerfect ? 150 : 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22A652', '#00A3E0', '#FFD93D', '#FF6B6B']
      });
    }
  });

  function handleContinue() {
    goto('/quiz');
  }

  function handleBackToAR() {
    goto('/ar');
  }
</script>

<div class="min-h-full flex flex-col items-center justify-center px-6 py-8">
  <!-- Score circle -->
  <div class="relative mb-8">
    <div
      class="w-40 h-40 rounded-full flex items-center justify-center shadow-xl"
      class:bg-gradient-to-br={true}
      class:from-canopy-400={isPassing}
      class:to-ocean-500={isPassing}
      class:from-coral-400={!isPassing}
      class:to-orange-500={!isPassing}
    >
      <div class="w-32 h-32 rounded-full bg-white flex flex-col items-center justify-center">
        <span class="font-display text-4xl font-bold" class:text-canopy-600={isPassing} class:text-coral-600={!isPassing}>
          {score}
        </span>
        <span class="font-body text-sm text-gray-500">out of {totalQuestions}</span>
      </div>
    </div>

    <!-- Star decorations for perfect score -->
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
  <div class="text-center mb-8">
    <h2 class="font-display text-2xl md:text-3xl font-bold text-canopy-900 mb-2">
      {#if isPerfect}
        Perfect Score!
      {:else if isPassing}
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

  <!-- Score breakdown -->
  <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 mb-8 border border-canopy-100">
    <h3 class="font-accent font-semibold text-canopy-800 mb-4 flex items-center gap-2">
      <Icon icon="solar:chart-2-bold-duotone" class="w-5 h-5 text-canopy-500" />
      Your Performance
    </h3>

    <div class="space-y-4">
      <!-- Correct answers -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-canopy-100 flex items-center justify-center">
            <Icon icon="solar:check-circle-bold" class="w-5 h-5 text-canopy-500" />
          </div>
          <span class="font-body text-canopy-700">Correct Answers</span>
        </div>
        <span class="font-display font-bold text-canopy-600">{score}</span>
      </div>

      <!-- Incorrect answers -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center">
            <Icon icon="solar:close-circle-bold" class="w-5 h-5 text-coral-500" />
          </div>
          <span class="font-body text-canopy-700">Incorrect Answers</span>
        </div>
        <span class="font-display font-bold text-coral-600">{totalQuestions - score}</span>
      </div>

      <!-- Percentage bar -->
      <div class="pt-2">
        <div class="flex items-center justify-between mb-1">
          <span class="font-accent text-xs text-canopy-500">Accuracy</span>
          <span class="font-accent text-xs font-semibold" class:text-canopy-600={isPassing} class:text-coral-600={!isPassing}>
            {percentage}%
          </span>
        </div>
        <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-1000 ease-out"
            class:bg-gradient-to-r={true}
            class:from-canopy-400={isPassing}
            class:to-ocean-400={isPassing}
            class:from-coral-400={!isPassing}
            class:to-orange-400={!isPassing}
            style="width: {percentage}%"
          ></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Action buttons -->
  <div class="w-full max-w-sm space-y-3">
    {#if !isPassing}
      <Button onclick={onRetake} class="w-full" size="lg">
        <Icon icon="solar:refresh-bold" class="w-5 h-5" />
        Try Again
      </Button>
    {/if}

    <Button onclick={handleContinue} variant={isPassing ? 'default' : 'secondary'} class="w-full" size="lg">
      <Icon icon="solar:clipboard-list-bold" class="w-5 h-5" />
      All Quizzes
    </Button>

    <Button onclick={handleBackToAR} variant="ghost" class="w-full">
      <Icon icon="solar:camera-bold" class="w-5 h-5" />
      Back to AR Mode
    </Button>
  </div>
</div>
