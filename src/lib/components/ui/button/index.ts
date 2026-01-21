import Root from './button.svelte';

export type ButtonVariant = 'default' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'outline' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export {
  Root,
  Root as Button,
};
