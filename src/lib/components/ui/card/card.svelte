<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    children?: Snippet;
  }

  let { class: className, children, ...restProps }: Props = $props();
</script>

<div
  class={cn(
    'bg-white rounded-card p-5 shadow-md transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1',
    className
  )}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</div>
