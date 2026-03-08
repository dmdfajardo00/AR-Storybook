<script lang="ts">
  import Icon from '@iconify/svelte';
  import { Button } from '$lib/components/ui/button';
  import { NarrationButton } from '$lib/components/shared';
  import { sfx } from '$lib/utils';
  import type { ComicHotspot } from '$lib/types';

  interface Props {
    pageNumber: number;
    comicImageUrl: string;
    hotspots: ComicHotspot[];
    audioUrls?: string[];
    onHotspotClick: (hotspot: ComicHotspot) => void;
    onBack: () => void;
    hasNextPage?: boolean;
    onNextPage?: () => void;
  }

  let { pageNumber, comicImageUrl, hotspots, audioUrls, onHotspotClick, onBack, hasNextPage = false, onNextPage }: Props = $props();

  let hoveredHotspot = $state<string | null>(null);
  let imageLoaded = $state(false);

  function handleHotspotClick(hotspot: ComicHotspot) {
    sfx.tap();
    onHotspotClick(hotspot);
  }

  function handleHotspotMouseEnter(id: string) {
    hoveredHotspot = id;
  }

  function handleHotspotMouseLeave() {
    hoveredHotspot = null;
  }

  function handleImageLoad() {
    imageLoaded = true;
  }
</script>

<div class="fixed inset-0 bg-canopy-900 z-40 flex flex-col">
  <!-- Header with back button and page number -->
  <header class="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-canopy-900/90 to-transparent absolute top-0 left-0 right-0 z-50 safe-top">
    <Button
      variant="ghost"
      size="sm"
      onclick={onBack}
      class="text-white hover:bg-white/10 gap-2"
    >
      <Icon icon="solar:arrow-left-linear" class="w-5 h-5" />
      <span class="font-accent">Back</span>
    </Button>

    <div class="flex items-center gap-2">
      <div class="px-3 py-1.5 rounded-full bg-canopy-500/90 backdrop-blur-sm">
        <span class="font-display text-sm font-bold text-white">Page {pageNumber}</span>
      </div>
      {#if audioUrls?.length}
        <NarrationButton src={audioUrls} label="Listen" />
      {/if}
    </div>

    {#if hasNextPage}
      <Button
        variant="ghost"
        size="sm"
        onclick={() => { sfx.pageTurn(); onNextPage?.(); }}
        class="text-white hover:bg-white/10 gap-1"
      >
        <span class="font-accent">Next</span>
        <Icon icon="solar:arrow-right-linear" class="w-5 h-5" />
      </Button>
    {:else}
      <div class="w-20"></div>
    {/if}
  </header>

  <!-- Comic image container -->
  <div class="flex-1 flex items-center justify-center relative overflow-hidden">
    <!-- Loading state -->
    {#if !imageLoaded}
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-canopy-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    {/if}

    <!-- Comic image with hotspots -->
    <div class="relative max-w-full max-h-full" class:opacity-0={!imageLoaded} class:opacity-100={imageLoaded}>
      <img
        src={comicImageUrl}
        alt="Comic page {pageNumber}"
        class="max-w-full max-h-[calc(100dvh-80px)] w-auto h-auto object-contain transition-opacity duration-300"
        onload={handleImageLoad}
      />

      <!-- Hotspot overlays -->
      {#each hotspots as hotspot (hotspot.id)}
        <button
          class="hotspot absolute cursor-pointer transition-all duration-200"
          style="
            left: {hotspot.x}%;
            top: {hotspot.y}%;
            width: {hotspot.width}%;
            height: {hotspot.height}%;
            transform: translate(-50%, -50%);
          "
          onclick={() => handleHotspotClick(hotspot)}
          onmouseenter={() => handleHotspotMouseEnter(hotspot.id)}
          onmouseleave={handleHotspotMouseLeave}
          onfocus={() => handleHotspotMouseEnter(hotspot.id)}
          onblur={handleHotspotMouseLeave}
          aria-label="View 3D model: {hotspot.title}"
        >
          <!-- Hotspot ellipse -->
          <div class="hotspot-ellipse w-full h-full rounded-[50%] border-2 border-dashed transition-all duration-200"
               class:hovered={hoveredHotspot === hotspot.id}
          ></div>

          <!-- Tooltip on hover -->
          {#if hoveredHotspot === hotspot.id}
            <div class="tooltip absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full
                        bg-canopy-900/95 text-white px-3 py-2 rounded-lg
                        font-accent text-sm font-medium whitespace-nowrap
                        shadow-lg backdrop-blur-sm z-10
                        animate-fadeIn pointer-events-none">
              <span class="flex items-center gap-2">
                <Icon icon="solar:box-minimalistic-bold" class="w-4 h-4 text-canopy-400" />
                {hotspot.title}
              </span>
              <!-- Tooltip arrow -->
              <div class="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0
                          border-l-[6px] border-l-transparent
                          border-r-[6px] border-r-transparent
                          border-t-[6px] border-t-canopy-900/95"></div>
            </div>
          {/if}

          <!-- Tap indicator icon -->
          <div class="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-canopy-500/90
                      flex items-center justify-center shadow-md
                      opacity-80 hover:opacity-100 transition-opacity">
            <Icon icon="solar:hand-shake-linear" class="w-3.5 h-3.5 text-white" />
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Help text at bottom -->
  <div class="flex-shrink-0 px-4 py-3 text-center bg-gradient-to-t from-canopy-900/90 to-transparent safe-bottom">
    <p class="font-body text-sm text-canopy-100/80">
      <Icon icon="solar:cursor-bold" class="w-4 h-4 inline-block mr-1 align-text-bottom" />
      Tap highlighted areas to view 3D models
    </p>
  </div>
</div>

<style>
  .hotspot-ellipse {
    border-color: #22A652;
    background-color: rgba(34, 166, 82, 0.15);
    box-shadow: 0 0 20px rgba(34, 166, 82, 0.5);
    animation: pulse 2s ease-in-out infinite;
  }

  .hotspot-ellipse.hovered {
    border-color: #4ACD78;
    background-color: rgba(34, 166, 82, 0.25);
    box-shadow: 0 0 30px rgba(34, 166, 82, 0.7);
    animation: none;
    transform: scale(1.05);
  }

  .hotspot:focus {
    outline: none;
  }

  .hotspot:focus .hotspot-ellipse {
    border-color: #FF6B4A;
    box-shadow: 0 0 0 3px rgba(255, 107, 74, 0.4), 0 0 20px rgba(34, 166, 82, 0.5);
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      box-shadow: 0 0 20px rgba(34, 166, 82, 0.5);
    }
    50% {
      opacity: 0.8;
      box-shadow: 0 0 30px rgba(34, 166, 82, 0.7);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-100%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(-100%) scale(1);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }

  /* Ensure proper touch targets on mobile */
  @media (max-width: 640px) {
    .hotspot {
      min-width: 44px;
      min-height: 44px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .hotspot-ellipse {
      animation: none;
    }

    .animate-fadeIn {
      animation: none;
    }
  }
</style>
