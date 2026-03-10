<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { BottomNav } from '$lib/components/layout';
  import { sfx } from '$lib/utils';
  import { userStore } from '$lib/stores/user.svelte';
  import { quizStore } from '$lib/stores/quiz.svelte';
  import { progressionStore } from '$lib/stores/progression.svelte';
  import type { Snippet } from 'svelte';
  import { browser } from '$app/environment';
  import { Capacitor } from '@capacitor/core';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let sfxMuted = $state(sfx.isMuted());

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
    progressionStore.load();

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

    // Force-clean stale service workers on version bump (runs once per version)
    // Increment SW_VERSION to force all clients to purge old caches on next visit
    const SW_VERSION = '4';
    if (browser && 'serviceWorker' in navigator) {
      try {
        const storedVersion = localStorage.getItem('climatales_sw_version');
        if (storedVersion !== SW_VERSION) {
          console.log(`[SW] Version bump ${storedVersion} → ${SW_VERSION}, purging caches…`);
          // Unregister all existing service workers
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) await reg.unregister();
          // Delete all caches (precache + runtime)
          if ('caches' in window) {
            const names = await caches.keys();
            for (const name of names) await caches.delete(name);
          }
          // Persist BEFORE reload to prevent infinite loop
          // (wrapped in try — iOS private browsing throws on setItem)
          try { localStorage.setItem('climatales_sw_version', SW_VERSION); } catch {}
          window.location.reload();
          return;
        }
      } catch {
        // localStorage unavailable (iOS private browsing) — skip version check
      }
    }

    // PWA registration (only runs after version check passes)
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

  <!-- SFX Mute Toggle -->
  {#if showNav}
    <button
      onclick={() => { sfxMuted = sfx.toggleMute(); }}
      class="fixed bottom-20 right-3 z-40 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-canopy-600 hover:bg-white transition-colors touch-manipulation"
      aria-label={sfxMuted ? 'Unmute sound effects' : 'Mute sound effects'}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if sfxMuted}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        {/if}
      </svg>
    </button>
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
