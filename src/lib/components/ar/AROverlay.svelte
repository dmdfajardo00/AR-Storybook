<script lang="ts">
  import { goto } from '$app/navigation';
  import { arStore } from '$lib/stores/ar.svelte';
  import { getStoryPages } from '$lib/utils/content';
  import type { StoryPage } from '$lib/types';
  import Icon from '@iconify/svelte';
  import { Button } from '$lib/components/ui/button';
  import AudioButton from '$lib/components/shared/AudioButton.svelte';
  import { onMount } from 'svelte';

  let pages = $state<StoryPage[]>([]);
  let currentPage = $derived<StoryPage | null>(
    arStore.detectedPageIndex !== null && pages.length > 0
      ? pages[arStore.detectedPageIndex] ?? null
      : null
  );

  let isExpanded = $state(false);

  onMount(async () => {
    pages = await getStoryPages();
  });

  function handleStartQuiz() {
    if (currentPage) {
      goto(`/quiz/${currentPage.id}`);
    }
  }

  function handleNextPage() {
    if (arStore.detectedPageIndex !== null && arStore.detectedPageIndex < pages.length - 1) {
      // In a real AR scenario, we'd prompt user to scan next page
      // For demo mode, we just show a message
      arStore.onTargetLost();
    }
  }

  function handleClose() {
    isExpanded = false;
    arStore.onTargetLost();
  }

  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
</script>

{#if arStore.shouldShowOverlay && currentPage}
  <div class="fixed inset-x-0 bottom-0 z-50 pb-nav pointer-events-none">
    <div class="px-4 pb-4 pointer-events-auto">
      <!-- Main content card -->
      <div
        class="relative bg-gradient-to-br from-canopy-50 via-white to-ocean-50 rounded-2xl shadow-2xl overflow-hidden animate-slideUp border border-canopy-200/50"
        style="box-shadow: 0 -10px 40px -10px rgba(34, 166, 82, 0.3), 0 10px 30px -10px rgba(0, 0, 0, 0.2);"
      >
        <!-- Decorative top bar -->
        <div class="h-1 bg-gradient-to-r from-canopy-400 via-ocean-400 to-canopy-400"></div>

        <!-- Close button -->
        <button
          onclick={handleClose}
          class="absolute top-3 right-3 w-8 h-8 rounded-full bg-canopy-100 hover:bg-canopy-200 flex items-center justify-center transition-colors z-10"
        >
          <Icon icon="solar:close-circle-linear" class="w-5 h-5 text-canopy-600" />
        </button>

        <!-- Header with page info -->
        <div class="px-5 pt-4 pb-3">
          <div class="flex items-start gap-3">
            <!-- Page number badge -->
            <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-canopy-500 to-ocean-500 flex items-center justify-center shadow-md">
              <span class="font-display text-xl font-bold text-white">{currentPage.id}</span>
            </div>

            <div class="flex-1 min-w-0 pr-8">
              <h3 class="font-display text-lg font-bold text-canopy-900 leading-tight">
                {currentPage.title}
              </h3>
              <p class="font-body text-sm text-canopy-600 mt-0.5 line-clamp-1">
                {currentPage.description}
              </p>
            </div>
          </div>
        </div>

        <!-- Expandable explanation -->
        <div class={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-64' : 'max-h-0'}`}>
          <div class="px-5 pb-4">
            <div class="bg-white/80 rounded-xl p-4 border border-canopy-100">
              <p class="font-body text-canopy-800 text-sm leading-relaxed">
                {@html currentPage.explanation}
              </p>
            </div>
          </div>
        </div>

        <!-- Action bar -->
        <div class="px-5 pb-5 flex items-center gap-3">
          <!-- Expand/collapse button -->
          <button
            onclick={toggleExpanded}
            class="flex items-center gap-2 px-4 py-2 rounded-full bg-canopy-100 hover:bg-canopy-200 transition-colors"
          >
            <Icon
              icon={isExpanded ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
              class="w-4 h-4 text-canopy-600"
            />
            <span class="font-accent text-sm font-medium text-canopy-700">
              {isExpanded ? 'Less' : 'Learn More'}
            </span>
          </button>

          <!-- Audio button -->
          {#if currentPage.audioUrls?.length}
            <AudioButton src={currentPage.audioUrls} size="sm" />
          {/if}

          <!-- Spacer -->
          <div class="flex-1"></div>

          <!-- Quiz button -->
          <Button onclick={handleStartQuiz} size="sm" class="gap-2">
            <Icon icon="solar:clipboard-check-bold" class="w-4 h-4" />
            Take Quiz
          </Button>
        </div>

        <!-- Progress indicator -->
        <div class="px-5 pb-4">
          <div class="flex items-center gap-2">
            <span class="font-accent text-xs text-canopy-500">Progress</span>
            <div class="flex-1 h-1.5 bg-canopy-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-canopy-400 to-ocean-400 rounded-full transition-all duration-500"
                style="width: {((currentPage.id) / pages.length) * 100}%"
              ></div>
            </div>
            <span class="font-accent text-xs text-canopy-500">{currentPage.id}/{pages.length}</span>
          </div>
        </div>
      </div>

      <!-- Floating mascot -->
      <div class="absolute -top-16 -left-2 w-20 h-20 animate-float pointer-events-none">
        <div class="w-full h-full rounded-full bg-gradient-to-br from-canopy-400 to-ocean-500 shadow-lg flex items-center justify-center">
          <Icon icon="solar:planet-bold-duotone" class="w-10 h-10 text-white" />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slideUp {
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>
