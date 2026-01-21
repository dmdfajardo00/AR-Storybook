<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '@iconify/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    title?: string;
    showBack?: boolean;
    class?: string;
  }

  let { title, showBack = false, class: className }: Props = $props();

  function goBack() {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }
</script>

<header
  class={cn(
    'sticky top-0 z-40 bg-mist/95 backdrop-blur-sm',
    className
  )}
>
  <div class="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
    <!-- Left: Back button or spacer -->
    <div class="w-10">
      {#if showBack}
        <button
          onclick={goBack}
          class="flex items-center justify-center w-10 h-10 rounded-full text-canopy-700 hover:bg-canopy-100 transition-colors"
          aria-label="Go back"
        >
          <Icon icon="solar:arrow-left-linear" class="w-6 h-6" />
        </button>
      {/if}
    </div>

    <!-- Center: Title -->
    {#if title}
      <h1 class="font-display text-lg font-semibold text-canopy-900 text-center flex-1">
        {title}
      </h1>
    {:else}
      <div class="flex-1"></div>
    {/if}

    <!-- Right: Spacer for symmetry -->
    <div class="w-10"></div>
  </div>
</header>
