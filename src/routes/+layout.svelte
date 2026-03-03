<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { BottomNav } from '$lib/components/layout';
  import { userStore } from '$lib/stores/user.svelte';
  import { quizStore } from '$lib/stores/quiz.svelte';
  import type { Snippet } from 'svelte';
  import { browser } from '$app/environment';
  import { Capacitor } from '@capacitor/core';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  // Pages that should not show the bottom nav
  const noNavPages = ['/'];
  let showNav = $derived(!noNavPages.includes($page.url.pathname));

  // PWA update state
  let needRefresh = $state(false);
  let offlineReady = $state(false);
  let updateServiceWorker: (() => Promise<void>) | undefined = $state(undefined);

  onMount(async () => {
    // Load persisted data
    userStore.load();
    quizStore.load();

    // Configure safe areas for native Android
    if (Capacitor.isNativePlatform()) {
      document.documentElement.classList.add('native-app');
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setOverlaysWebView({ overlay: true });
      } catch (e) {
        console.log('StatusBar plugin not available:', e);
      }
    }

    // PWA registration
    if (browser && 'serviceWorker' in navigator) {
      try {
        // @ts-expect-error - virtual:pwa-register is provided by vite-plugin-pwa
        const { registerSW } = await import('virtual:pwa-register');
        updateServiceWorker = registerSW({
          immediate: true,
          onNeedRefresh() {
            needRefresh = true;
          },
          onOfflineReady() {
            offlineReady = true;
            // Auto-hide after 3 seconds
            setTimeout(() => {
              offlineReady = false;
            }, 3000);
          },
          onRegisteredSW(swUrl: string, registration: ServiceWorkerRegistration | undefined) {
            console.log('SW registered:', swUrl);
            // Check for updates every hour
            if (registration) {
              setInterval(() => {
                registration.update();
              }, 60 * 60 * 1000);
            }
          },
          onRegisterError(error: Error) {
            console.error('SW registration error:', error);
          }
        });
      } catch (e) {
        console.log('PWA not available:', e);
      }
    }
  });

  function handleUpdate() {
    if (updateServiceWorker) {
      updateServiceWorker();
      needRefresh = false;
    }
  }

  function dismissUpdate() {
    needRefresh = false;
  }
</script>

<svelte:head>
  <title>ClimaTales AR</title>
</svelte:head>

<div class="min-h-screen min-h-dvh bg-mist">
  <main class={showNav ? 'pb-nav' : ''}>
    {@render children()}
  </main>

  {#if showNav}
    <BottomNav />
  {/if}

  <!-- PWA Update Toast -->
  {#if needRefresh}
    <div
      class="fixed bottom-20 left-4 right-4 mx-auto max-w-sm z-[100] animate-slideUp"
      role="alert"
    >
      <div class="bg-canopy-800 text-white rounded-xl p-4 shadow-xl flex items-center gap-3">
        <div class="flex-1">
          <p class="font-accent font-semibold text-sm">Update Available</p>
          <p class="text-xs text-white/80">A new version is ready to install.</p>
        </div>
        <button
          onclick={handleUpdate}
          class="bg-coral-400 hover:bg-coral-500 text-white font-accent font-semibold px-4 py-2 rounded-lg text-sm transition-colors touch-manipulation"
        >
          Update
        </button>
        <button
          onclick={dismissUpdate}
          class="text-white/60 hover:text-white p-2 -mr-2 touch-manipulation"
          aria-label="Dismiss"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  {/if}

  <!-- Offline Ready Toast -->
  {#if offlineReady}
    <div
      class="fixed bottom-20 left-4 right-4 mx-auto max-w-sm z-[100] animate-slideUp"
      role="status"
    >
      <div class="bg-canopy-600 text-white rounded-xl p-4 shadow-xl flex items-center gap-3">
        <svg class="w-6 h-6 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <p class="font-accent font-semibold text-sm">App ready for offline use!</p>
      </div>
    </div>
  {/if}
</div>
