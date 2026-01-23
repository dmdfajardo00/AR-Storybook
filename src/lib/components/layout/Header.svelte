<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '@iconify/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    title?: string;
    showBack?: boolean;
    showLogo?: boolean;
    class?: string;
  }

  let { title, showBack = false, showLogo = false, class: className }: Props = $props();

  function goBack() {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }
</script>

<header
  class={cn(
    'sticky top-0 z-40 bg-mist/95 backdrop-blur-sm safe-top',
    className
  )}
>
  <div class="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
    <!-- Left: Back button or Logo -->
    <div class="w-10 flex items-center">
      {#if showBack}
        <button
          onclick={goBack}
          class="flex items-center justify-center w-10 h-10 rounded-full text-canopy-700 hover:bg-canopy-100 active:bg-canopy-200 transition-colors touch-manipulation"
          aria-label="Go back"
        >
          <Icon icon="solar:arrow-left-linear" class="w-6 h-6" />
        </button>
      {:else if showLogo}
        <a href="/" class="flex items-center touch-manipulation" aria-label="Home">
          <img
            src="/icons/icon-72x72.png"
            alt="ClimaTales AR"
            class="w-9 h-9 rounded-lg shadow-sm"
            width="36"
            height="36"
          />
        </a>
      {/if}
    </div>

    <!-- Center: Title or Logo -->
    {#if title}
      <h1 class="font-display text-lg font-semibold text-canopy-900 text-center flex-1 truncate px-2">
        {title}
      </h1>
    {:else if !showLogo}
      <a href="/" class="flex items-center gap-2 touch-manipulation" aria-label="Home">
        <img
          src="/icons/icon-72x72.png"
          alt="ClimaTales AR"
          class="w-9 h-9 rounded-lg shadow-sm"
          width="36"
          height="36"
        />
        <span class="font-display text-lg font-bold text-canopy-800">ClimaTales</span>
      </a>
    {:else}
      <div class="flex-1"></div>
    {/if}

    <!-- Right: Spacer for symmetry -->
    <div class="w-10"></div>
  </div>
</header>

<style>
  .safe-top {
    padding-top: env(safe-area-inset-top, 0);
  }
</style>
