<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '@iconify/svelte';
  import { cn } from '$lib/utils';

  interface NavItem {
    id: string;
    label: string;
    icon: string;
    iconActive: string;
    path: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'ar',
      label: 'AR Mode',
      icon: 'solar:camera-linear',
      iconActive: 'solar:camera-bold',
      path: '/ar',
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: 'solar:clipboard-list-linear',
      iconActive: 'solar:clipboard-list-bold',
      path: '/quiz',
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: 'solar:play-circle-linear',
      iconActive: 'solar:play-circle-bold',
      path: '/videos',
    },
  ];

  let currentPath = $derived($page.url.pathname);
</script>

<nav class="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
  <div class="bg-canopy-500 mx-auto max-w-lg shadow-xl">
    <div class="flex justify-around items-center h-[72px] px-2">
      {#each navItems as item (item.id)}
        {@const isActive = currentPath.startsWith(item.path)}
        <a
          href={item.path}
          class={cn(
            'flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[56px] px-3 py-2 transition-all duration-200 touch-manipulation active:scale-95',
            isActive
              ? 'bg-white text-canopy-600 shadow-md scale-105'
              : 'text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20'
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          <Icon
            icon={isActive ? item.iconActive : item.icon}
            class="w-6 h-6"
          />
          <span class="font-accent text-[11px] font-semibold leading-tight">{item.label}</span>
        </a>
      {/each}
    </div>
  </div>
</nav>
