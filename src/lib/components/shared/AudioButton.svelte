<script lang="ts">
  import Icon from '@iconify/svelte';
  import { cn } from '$lib/utils';
  import { playAudio, stopAudio, isPlaying as checkIsPlaying } from '$lib/utils/audio';

  interface Props {
    src: string;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }

  let { src, size = 'md', class: className }: Props = $props();

  let isPlaying = $state(false);
  let isLoading = $state(false);

  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  async function handleClick() {
    if (isPlaying) {
      stopAudio();
      isPlaying = false;
    } else {
      isLoading = true;
      try {
        isPlaying = true;
        await playAudio(src);
      } catch (error) {
        console.error('Failed to play audio:', error);
      } finally {
        isPlaying = false;
        isLoading = false;
      }
    }
  }
</script>

<button
  onclick={handleClick}
  disabled={isLoading}
  class={cn(
    'inline-flex items-center justify-center rounded-full bg-canopy-500 text-white transition-all duration-200',
    'hover:bg-canopy-600 hover:scale-105 active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy-400 focus-visible:ring-offset-2',
    sizeStyles[size],
    className
  )}
  aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
>
  {#if isLoading}
    <div class={cn('border-2 border-white/30 border-t-white rounded-full animate-spin', iconSizeStyles[size])}></div>
  {:else if isPlaying}
    <Icon icon="solar:stop-bold" class={iconSizeStyles[size]} />
  {:else}
    <Icon icon="solar:volume-loud-bold" class={iconSizeStyles[size]} />
  {/if}
</button>
