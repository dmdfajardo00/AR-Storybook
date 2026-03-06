<script lang="ts">
  import Icon from '@iconify/svelte';
  import { cn } from '$lib/utils';
  import { playAudio, playAudioSequence, stopAudio } from '$lib/utils/audio';

  interface Props {
    src: string | string[];
    label?: string;
    class?: string;
  }

  let { src, label = 'Listen', class: className }: Props = $props();

  let isPlaying = $state(false);

  async function handleClick() {
    if (isPlaying) {
      stopAudio();
      isPlaying = false;
    } else {
      isPlaying = true;
      try {
        if (Array.isArray(src)) {
          await playAudioSequence(src);
        } else {
          await playAudio(src);
        }
      } catch (error) {
        console.error('Failed to play narration:', error);
      } finally {
        isPlaying = false;
      }
    }
  }
</script>

<button
  onclick={handleClick}
  class={cn(
    'inline-flex items-center gap-2 px-4 py-2 rounded-full font-accent font-semibold text-sm text-white',
    'transition-all duration-200 shadow-md',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'active:scale-95',
    isPlaying
      ? 'bg-gradient-to-r from-coral-400 to-coral-500 hover:from-coral-500 hover:to-coral-600 focus-visible:ring-coral-400 shadow-[0_0_16px_rgba(255,107,74,0.4)]'
      : 'bg-gradient-to-r from-canopy-500 to-ocean-500 hover:from-canopy-600 hover:to-ocean-600 hover:scale-105 focus-visible:ring-canopy-400',
    className
  )}
  aria-label={isPlaying ? 'Stop narration' : `Play narration: ${label}`}
  aria-pressed={isPlaying}
>
  {#if isPlaying}
    <!-- Waveform bars -->
    <span class="waveform" aria-hidden="true">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </span>
    <span>Stop</span>
  {:else}
    <Icon icon="solar:volume-loud-bold" class="w-4 h-4 flex-shrink-0" />
    <span>{label}</span>
  {/if}
</button>

<style>
  .waveform {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    height: 16px;
  }

  .bar {
    display: block;
    width: 3px;
    border-radius: 9999px;
    background: white;
    animation: wave 0.8s ease-in-out infinite;
  }

  .bar:nth-child(1) { height: 6px; animation-delay: 0s; }
  .bar:nth-child(2) { height: 12px; animation-delay: 0.15s; }
  .bar:nth-child(3) { height: 8px; animation-delay: 0.3s; }

  @keyframes wave {
    0%, 100% { transform: scaleY(1); opacity: 1; }
    50% { transform: scaleY(1.8); opacity: 0.8; }
  }

  @media (prefers-reduced-motion: reduce) {
    .bar { animation: none; height: 10px; }
  }
</style>
