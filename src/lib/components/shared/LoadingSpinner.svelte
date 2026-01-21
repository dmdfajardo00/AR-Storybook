<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }

  let { size = 'md', class: className }: Props = $props();

  const sizeStyles = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };
</script>

<div
  class={cn(
    'rounded-full border-canopy-200 border-t-canopy-500 animate-spin',
    sizeStyles[size],
    className
  )}
  role="status"
  aria-label="Loading"
>
  <span class="sr-only">Loading...</span>
</div>
