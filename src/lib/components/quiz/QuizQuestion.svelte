<script lang="ts">
  import type { QuizQuestion as QuizQuestionType } from '$lib/types';
  import QuizOption from './QuizOption.svelte';
  import { Button } from '$lib/components/ui/button';
  import Icon from '@iconify/svelte';
  import { sfx } from '$lib/utils';

  interface Props {
    question: QuizQuestionType;
    questionNumber: number;
    totalQuestions: number;
    selectedOptionId?: string | null;
    showResult?: boolean;
    onSelect?: (optionId: string) => void;
    onSubmit?: () => void;
    onNext?: () => void;
    onRetry?: () => void;
  }

  let {
    question,
    questionNumber,
    totalQuestions,
    selectedOptionId = null,
    showResult = false,
    onSelect,
    onSubmit,
    onNext,
    onRetry
  }: Props = $props();

  const isCorrect = $derived(selectedOptionId === question.correctOptionId);
  const canSubmit = $derived(selectedOptionId !== null && !showResult);
  const selectedOption = $derived(question.options.find(o => o.id === selectedOptionId));
  const correctOption = $derived(question.options.find(o => o.id === question.correctOptionId));

  $effect(() => {
    if (showResult) {
      if (isCorrect) sfx.correct();
      else sfx.incorrect();
    }
  });
</script>

<div class="flex flex-col h-full">
  <!-- Progress indicator -->
  <div class="mb-6">
    <div class="flex items-center justify-between mb-2">
      <span class="font-accent text-sm text-canopy-600">Question {questionNumber} of {totalQuestions}</span>
      <span class="font-accent text-sm text-canopy-500">{Math.round((questionNumber / totalQuestions) * 100)}%</span>
    </div>
    <div class="h-2 bg-canopy-100 rounded-full overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-canopy-400 to-ocean-400 rounded-full transition-all duration-500 ease-out"
        style="width: {(questionNumber / totalQuestions) * 100}%"
      ></div>
    </div>
  </div>

  <!-- Question text -->
  <div class="mb-6">
    <h2 class="font-display text-xl md:text-2xl font-bold text-canopy-900 leading-tight">
      {question.question}
    </h2>
    {#if question.hint && !showResult}
      <div class="mt-3 flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
        <Icon icon="solar:lightbulb-bolt-bold-duotone" class="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <p class="font-body text-sm text-canopy-700">{question.hint}</p>
      </div>
    {/if}
  </div>

  <!-- Options -->
  <div class="flex-1 space-y-3 mb-6">
    {#each question.options as option, index}
      <QuizOption
        id={option.id}
        text={option.text}
        {index}
        selected={selectedOptionId === option.id}
        disabled={showResult}
        {showResult}
        isCorrect={option.id === question.correctOptionId}
        wasSelected={selectedOptionId === option.id}
        onclick={() => onSelect?.(option.id)}
      />
    {/each}
  </div>

  <!-- Result feedback -->
  {#if showResult}
    <div class="mb-6 space-y-4">
      {#if isCorrect}
        <div class="relative overflow-hidden bg-gradient-to-br from-canopy-100 via-canopy-50 to-ocean-50 rounded-2xl p-5 border-2 border-canopy-300 animate-celebrate">
          <div class="absolute top-0 right-0 w-24 h-24 bg-canopy-200 rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          <div class="relative flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-canopy-400 to-canopy-600 flex items-center justify-center shadow-lg shrink-0">
              <Icon icon="solar:star-bold" class="w-8 h-8 text-white" />
            </div>
            <div class="flex-1">
              <h3 class="font-display text-xl font-bold text-canopy-800">You Got It Right!</h3>
              {#if selectedOption?.rationale}
                <p class="font-body text-sm text-canopy-700 mt-1">{selectedOption.rationale}</p>
              {:else}
                <p class="font-body text-sm text-canopy-600">Great job, explorer!</p>
              {/if}
            </div>
          </div>
        </div>
      {:else}
        <div class="relative overflow-hidden bg-gradient-to-br from-coral-100 via-coral-50 to-orange-50 rounded-2xl p-5 border-2 border-coral-300 animate-wiggle">
          <div class="absolute top-0 right-0 w-24 h-24 bg-coral-200 rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          <div class="relative flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center shadow-lg shrink-0">
              <Icon icon="solar:refresh-bold" class="w-8 h-8 text-white" />
            </div>
            <div class="flex-1">
              <h3 class="font-display text-xl font-bold text-coral-800">Not Quite!</h3>
              {#if selectedOption?.rationale}
                <p class="font-body text-sm text-coral-700 mt-1">{selectedOption.rationale}</p>
              {:else}
                <p class="font-body text-sm text-coral-600">Try again to find the correct answer!</p>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Action buttons -->
  <div class="mt-auto">
    {#if !showResult}
      <Button
        onclick={onSubmit}
        disabled={!canSubmit}
        class="w-full"
        size="lg"
      >
        <Icon icon="solar:check-circle-bold" class="w-5 h-5" />
        Check Answer
      </Button>
    {:else if isCorrect}
      <Button
        onclick={onNext}
        class="w-full"
        size="lg"
      >
        {questionNumber < totalQuestions ? 'Next Question' : 'See Results'}
        <Icon icon="solar:arrow-right-bold" class="w-5 h-5" />
      </Button>
    {:else}
      <Button
        onclick={onRetry}
        class="w-full"
        size="lg"
      >
        <Icon icon="solar:refresh-bold" class="w-5 h-5" />
        Try Again
      </Button>
    {/if}
  </div>
</div>

<style>
  @keyframes celebrate {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  .animate-celebrate {
    animation: celebrate 0.6s ease-in-out;
  }
</style>
