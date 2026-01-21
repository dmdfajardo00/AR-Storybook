<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    class?: string;
    value?: string;
  }

  let { class: className, value = $bindable(''), ...restProps }: Props = $props();
</script>

<input
  bind:value
  class={cn(
    'flex w-full font-body text-base text-canopy-900 bg-meadow border-2 border-transparent rounded-input px-4 py-3',
    'placeholder:text-canopy-700/50',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:border-canopy-500 focus:bg-white focus:shadow-sm',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    className
  )}
  {...restProps}
/>
