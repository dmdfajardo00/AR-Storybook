<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { ButtonVariant, ButtonSize } from './index';

  interface Props extends HTMLButtonAttributes {
    variant?: ButtonVariant;
    size?: ButtonSize;
    class?: string;
    children?: Snippet;
  }

  let {
    variant = 'default',
    size = 'default',
    class: className,
    children,
    ...restProps
  }: Props = $props();

  const variantStyles: Record<ButtonVariant, string> = {
    default: 'bg-gradient-to-r from-canopy-500 to-ocean-500 text-white shadow-md hover:shadow-lg hover:shadow-canopy-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    secondary: 'bg-white text-canopy-600 border-2 border-canopy-500 hover:bg-canopy-50 active:bg-canopy-100',
    accent: 'bg-gradient-to-r from-warning to-coral-400 text-white shadow-md hover:shadow-lg hover:shadow-coral-400/20 hover:-translate-y-0.5',
    ghost: 'text-canopy-900 hover:bg-canopy-100 active:bg-canopy-200',
    destructive: 'bg-error text-white hover:bg-error/90 shadow-md',
    outline: 'border-2 border-canopy-200 text-canopy-700 hover:bg-canopy-50 hover:border-canopy-300',
    link: 'text-canopy-600 underline-offset-4 hover:underline',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    default: 'px-6 py-3 text-base',
    sm: 'px-4 py-2 text-sm',
    lg: 'px-8 py-4 text-lg',
    icon: 'h-10 w-10 p-0',
  };
</script>

<button
  class={cn(
    'inline-flex items-center justify-center gap-2 font-accent font-semibold rounded-button transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:ring-offset-2',
    variantStyles[variant],
    sizeStyles[size],
    className
  )}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</button>
