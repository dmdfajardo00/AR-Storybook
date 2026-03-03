<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';
  import { getVideos } from '$lib/utils/content';
  import { getYouTubeId, openYouTube } from '$lib/utils';
  import type { Video } from '$lib/types';

  interface VideoCategory {
    category: string;
    name: string;
    description: string;
    videos: Video[];
  }

  let categories = $state<VideoCategory[]>([]);
  let allCategories = $state<VideoCategory[]>([]);
  let isLoading = $state(true);
  let activeCategory = $state<string | null>(null);
  let playingVideoId = $state<string | null>(null);

  const categoryIcons: Record<string, string> = {
    'all': 'solar:video-library-bold-duotone',
    'carbon-cycle': 'solar:leaf-bold-duotone',
    'human-actions': 'solar:buildings-bold-duotone',
    'climate-change': 'solar:sun-fog-bold-duotone',
    'solutions': 'solar:lightbulb-bolt-bold-duotone',
  };

  onMount(async () => {
    const loadedCategories = await getVideos();
    allCategories = loadedCategories;

    const allVideos = loadedCategories.flatMap(cat => cat.videos);
    const allCategory: VideoCategory = {
      category: 'all',
      name: 'All',
      description: 'Watch all educational videos',
      videos: allVideos
    };

    categories = [allCategory, ...loadedCategories];
    activeCategory = 'all';
    isLoading = false;
  });

  function getYouTubeThumbnail(url: string): string {
    const videoId = getYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  }

  function handlePlay(videoId: string) {
    playingVideoId = videoId;
  }

  function getCategoryButtonClass(cat: VideoCategory): string {
    const isActive = activeCategory === cat.category;
    let base = "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300";

    if (isActive) {
      base += " text-white shadow-md";
      if (cat.category === 'all') {
        base += " bg-gradient-to-r from-purple-500 to-purple-600";
      } else if (cat.category === 'carbon-cycle') {
        base += " bg-gradient-to-r from-canopy-500 to-canopy-600";
      } else if (cat.category === 'human-actions') {
        base += " bg-gradient-to-r from-ocean-500 to-ocean-600";
      } else if (cat.category === 'solutions') {
        base += " bg-gradient-to-r from-canopy-500 to-emerald-500";
      } else {
        base += " bg-gradient-to-r from-coral-500 to-orange-500";
      }
    } else {
      base += " bg-white text-canopy-700 border border-canopy-200";
    }

    return base;
  }

  function getIconBgClass(category: string): string {
    if (category === 'all') return "w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center";
    if (category === 'carbon-cycle') return "w-10 h-10 rounded-xl bg-canopy-100 flex items-center justify-center";
    if (category === 'human-actions') return "w-10 h-10 rounded-xl bg-ocean-100 flex items-center justify-center";
    if (category === 'solutions') return "w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center";
    return "w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center";
  }

  function getIconTextClass(category: string): string {
    if (category === 'all') return "w-5 h-5 text-purple-600";
    if (category === 'carbon-cycle') return "w-5 h-5 text-canopy-600";
    if (category === 'human-actions') return "w-5 h-5 text-ocean-600";
    if (category === 'solutions') return "w-5 h-5 text-emerald-600";
    return "w-5 h-5 text-coral-600";
  }
</script>

<svelte:head>
  <title>Videos - ClimaTales AR</title>
  <meta name="description" content="Watch educational videos about climate change and the environment" />
</svelte:head>

<div class="min-h-screen pb-nav bg-gradient-to-br from-coral-50 via-mist to-ocean-50">
  <!-- Header with gradient mesh background -->
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-coral-400 via-ocean-400 to-canopy-500"></div>

    <div class="relative px-6 py-8">
      <div class="max-w-lg mx-auto">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Icon icon="solar:play-circle-bold-duotone" class="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 class="font-display text-2xl md:text-3xl font-bold text-white">Learn More</h1>
            <p class="font-body text-white/80 mt-1">Watch videos about our planet</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Category tabs -->
  <div class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-canopy-100 shadow-sm">
    <div class="px-4 py-3 max-w-lg mx-auto">
      <div class="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {#each categories as cat}
          <button
            onclick={() => { activeCategory = cat.category; playingVideoId = null; }}
            class={getCategoryButtonClass(cat)}
          >
            <Icon icon={categoryIcons[cat.category] ?? 'solar:video-library-bold'} class="w-4 h-4" />
            <span class="font-accent text-sm font-medium whitespace-nowrap">{cat.name}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-4 py-6 max-w-lg mx-auto">
    {#if isLoading}
      <div class="flex flex-col items-center justify-center py-16">
        <div class="w-16 h-16 rounded-full border-4 border-canopy-200 border-t-canopy-500 animate-spin mb-4"></div>
        <p class="font-body text-canopy-600">Loading videos...</p>
      </div>
    {:else}
      {#each categories as cat}
        {#if cat.category === activeCategory}
          <div class="animate-fadeIn">
            <!-- Category description -->
            <div class="mb-6">
              <div class="flex items-center gap-3 mb-2">
                <div class={getIconBgClass(cat.category)}>
                  <Icon icon={categoryIcons[cat.category] ?? 'solar:video-library-bold'} class={getIconTextClass(cat.category)} />
                </div>
                <h2 class="font-display text-lg font-bold text-canopy-800">{cat.name}</h2>
              </div>
              <p class="font-body text-canopy-600 text-sm">{cat.description}</p>
            </div>

            <!-- Video cards -->
            <div class="space-y-4">
              {#each cat.videos as video (video.id)}
                <div
                  class="w-full bg-white rounded-2xl shadow-md overflow-hidden border border-canopy-100 transition-all duration-300 hover:shadow-xl"
                >
                  <!-- Video player / Thumbnail -->
                  <div class="relative aspect-video bg-gradient-to-br from-canopy-100 to-ocean-100 overflow-hidden">
                    {#if video.localVideoUrl && playingVideoId === video.id}
                      <!-- Local video player -->
                      <!-- svelte-ignore a11y_media_has_caption -->
                      <video
                        class="w-full h-full object-contain bg-black"
                        src={video.localVideoUrl}
                        controls
                        autoplay
                        playsinline
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    {:else}
                      <!-- Thumbnail with play button -->
                      <button
                        class="w-full h-full group cursor-pointer"
                        onclick={() => video.localVideoUrl ? handlePlay(video.id) : openYouTube(video.youtubeUrl)}
                      >
                        {#if getYouTubeThumbnail(video.youtubeUrl)}
                          <img
                            src={getYouTubeThumbnail(video.youtubeUrl)}
                            alt={video.title}
                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        {:else}
                          <div class="w-full h-full flex items-center justify-center">
                            <Icon icon="solar:video-frame-bold-duotone" class="w-16 h-16 text-canopy-300" />
                          </div>
                        {/if}

                        <!-- Play overlay -->
                        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                          <div class="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Icon icon="solar:play-bold" class="w-8 h-8 text-coral-500 ml-1" />
                          </div>
                        </div>
                      </button>
                    {/if}
                  </div>

                  <!-- Info -->
                  <div class="p-4">
                    <h3 class="font-accent font-semibold text-canopy-800 mb-1">
                      {video.title}
                    </h3>
                    {#if video.description}
                      <p class="font-body text-sm text-canopy-500 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                        {video.description}
                      </p>
                    {/if}

                    <div class="mt-3 flex items-center gap-3">
                      {#if video.localVideoUrl}
                        {#if playingVideoId === video.id}
                          <button
                            onclick={() => playingVideoId = null}
                            class="flex items-center gap-1.5 text-canopy-500 hover:text-canopy-700 font-accent text-sm transition-colors"
                          >
                            <Icon icon="solar:stop-circle-bold" class="w-4 h-4" />
                            <span>Close</span>
                          </button>
                        {:else}
                          <button
                            onclick={() => handlePlay(video.id)}
                            class="flex items-center gap-1.5 text-coral-500 hover:text-coral-600 font-accent text-sm transition-colors"
                          >
                            <Icon icon="solar:play-circle-bold" class="w-4 h-4" />
                            <span>Watch</span>
                          </button>
                        {/if}
                        <span class="text-canopy-200">|</span>
                        <a
                          href={video.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="flex items-center gap-1.5 text-canopy-400 hover:text-canopy-600 font-accent text-sm transition-colors"
                        >
                          <Icon icon="mdi:youtube" class="w-4 h-4" />
                          <span>YouTube</span>
                          <Icon icon="solar:arrow-right-up-linear" class="w-3 h-3" />
                        </a>
                      {:else}
                        <a
                          href={video.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="flex items-center gap-1.5 text-coral-500 hover:text-coral-600 font-accent text-sm transition-colors"
                        >
                          <Icon icon="solar:play-circle-bold" class="w-4 h-4" />
                          <span>Watch on YouTube</span>
                          <Icon icon="solar:arrow-right-up-linear" class="w-4 h-4" />
                        </a>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
    {/if}
  </div>
</div>
