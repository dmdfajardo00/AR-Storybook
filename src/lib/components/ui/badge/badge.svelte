<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { BadgeVariant } from './index';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    class?: string;
    children?: Snippet;
  }

  let { variant = 'default', class: className, children, ...restProps }: Props = $props();

  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-canopy-500 text-white',
    success: 'bg-success text-canopy-900',
    warning: 'bg-warning text-canopy-900',
    error: 'bg-error text-white',
    info: 'bg-info text-white',
    secondary: 'bg-canopy-100 text-canopy-700',
    outline: 'border-2 border-canopy-300 text-canopy-700 bg-transparent',
  };
</script>

<span
  class={cn(
    'inline-flex items-center px-3 py-1 rounded-badge font-accent font-semibold text-xs',
    variantStyles[variant],
    className
  )}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</span>
