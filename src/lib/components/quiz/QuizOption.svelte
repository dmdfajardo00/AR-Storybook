<script lang="ts">
  import Icon from '@iconify/svelte';
  import { cn, sfx } from '$lib/utils';

  interface Props {
    id: string;
    text: string;
    index: number;
    selected?: boolean;
    disabled?: boolean;
    showResult?: boolean;
    isCorrect?: boolean;
    wasSelected?: boolean;
    onclick?: () => void;
  }

  let {
    id,
    text,
    index,
    selected = false,
    disabled = false,
    showResult = false,
    isCorrect = false,
    wasSelected = false,
    onclick
  }: Props = $props();

  const letters = ['A', 'B', 'C', 'D'];
  const letter = $derived(letters[index] || '?');

  const baseClasses = "w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 text-left";

  const stateClasses = $derived(() => {
    if (showResult) {
      if (isCorrect) {
        return "bg-gradient-to-r from-canopy-50 to-canopy-100 border-canopy-400 shadow-md";
      }
      if (wasSelected && !isCorrect) {
        return "bg-gradient-to-r from-coral-50 to-coral-100 border-coral-400 shadow-md";
      }
      return "bg-gray-50 border-gray-200 opacity-60";
    }
    if (selected) {
      return "bg-gradient-to-r from-ocean-50 to-canopy-50 border-ocean-400 shadow-md scale-[1.02]";
    }
    if (disabled) {
      return "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed";
    }
    return "bg-white border-canopy-200 hover:border-canopy-400 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]";
  });
</script>

<button
  type="button"
  class={cn(baseClasses, stateClasses())}
  {disabled}
  onclick={() => { if (!disabled) { sfx.select(); onclick?.(); } }}
>
  <!-- Letter badge -->
  <div
    class={cn(
      "w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0 transition-all duration-300",
      showResult && isCorrect && "bg-canopy-500 text-white",
      showResult && wasSelected && !isCorrect && "bg-coral-500 text-white",
      showResult && !isCorrect && !wasSelected && "bg-gray-200 text-gray-500",
      !showResult && selected && "bg-ocean-500 text-white",
      !showResult && !selected && "bg-canopy-100 text-canopy-700"
    )}
  >
    {#if showResult && isCorrect}
      <Icon icon="solar:check-circle-bold" class="w-6 h-6" />
    {:else if showResult && wasSelected && !isCorrect}
      <Icon icon="solar:close-circle-bold" class="w-6 h-6" />
    {:else}
      {letter}
    {/if}
  </div>

  <!-- Answer text -->
  <span
    class={cn(
      "font-body text-base flex-1 transition-colors duration-300",
      showResult && isCorrect && "text-canopy-800 font-semibold",
      showResult && wasSelected && !isCorrect && "text-coral-800",
      showResult && !isCorrect && !wasSelected && "text-gray-500",
      !showResult && selected && "text-canopy-900 font-medium",
      !showResult && !selected && "text-canopy-700"
    )}
  >
    {text}
  </span>

  <!-- Selection indicator -->
  {#if !showResult && selected}
    <div class="w-6 h-6 rounded-full bg-ocean-500 flex items-center justify-center shrink-0">
      <Icon icon="solar:check-circle-bold" class="w-5 h-5 text-white" />
    </div>
  {/if}
</button>
