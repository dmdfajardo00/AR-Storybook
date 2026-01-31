<script lang="ts">
  import { onDestroy } from 'svelte';
  import { ARViewer, AROverlay, InteractiveComic, ModelViewerModal } from '$lib/components/ar';
  import { arStore } from '$lib/stores/ar.svelte';
  import type { StoryPage, ComicHotspot } from '$lib/types';

  // State
  let detectedPage = $state<StoryPage | null>(null);
  let showInteractiveComic = $state(false);
  let selectedPageNumber = $state<number | null>(null);

  // Model viewer modal state
  let isModelViewerOpen = $state(false);
  let selectedModelUrl = $state('');
  let selectedModelTitle = $state('');

  // Hotspots configuration for Page 2 (Carbon Cycle comic)
  // Models served from /static/models/ and cached by service worker for offline PWA
  const page2Hotspots: ComicHotspot[] = [
    {
      id: 'co2-molecules',
      title: 'CO₂ Molecules',
      modelUrl: '/models/page-2/CO2 Model.glb',
      x: 25,
      y: 45,
      width: 20,
      height: 15
    },
    {
      id: 'cow-photosynthesis',
      title: 'Cow & Photosynthesis',
      modelUrl: '/models/page-2/Cow eating grass.glb',
      x: 75,
      y: 45,
      width: 25,
      height: 18
    },
    {
      id: 'food-web',
      title: 'Ecosystem Food Web',
      modelUrl: '/models/page-2/Ecosystem (Food web).glb',
      x: 50,
      y: 78,
      width: 55,
      height: 22
    },
    {
      id: 'plant-co2',
      title: 'Plants & CO₂',
      modelUrl: '/models/page-2/Plant and CO2 Model.glb',
      x: 70,
      y: 18,
      width: 20,
      height: 10
    }
  ];

  // Get hotspots for a specific page
  function getHotspotsForPage(pageNumber: number): ComicHotspot[] {
    switch (pageNumber) {
      case 2:
        return page2Hotspots;
      default:
        return [];
    }
  }

  // Get comic image URL for a page
  function getComicImageUrl(pageNumber: number): string {
    return `/pages/Page ${pageNumber}.webp`;
  }

  function handlePageDetected(page: StoryPage) {
    detectedPage = page;
    selectedPageNumber = page.id;

    // For pages with hotspots, show interactive comic
    const hotspots = getHotspotsForPage(page.id);
    if (hotspots.length > 0) {
      showInteractiveComic = true;
    }
  }

  function handleHotspotClick(hotspot: ComicHotspot) {
    selectedModelUrl = hotspot.modelUrl;
    selectedModelTitle = hotspot.title;
    isModelViewerOpen = true;
  }

  function handleCloseModelViewer() {
    isModelViewerOpen = false;
    selectedModelUrl = '';
    selectedModelTitle = '';
  }

  function handleBackToGrid() {
    showInteractiveComic = false;
    selectedPageNumber = null;
    detectedPage = null;
    arStore.onTargetLost();
  }

  onDestroy(() => {
    arStore.reset();
  });
</script>

<svelte:head>
  <title>AR Mode - ClimaTales AR</title>
  <meta name="description" content="Scan storybook pages to unlock AR content about climate change" />
</svelte:head>

<div class="fixed inset-0 pb-nav">
  <!-- Page Selection Grid / AR Camera View -->
  {#if !showInteractiveComic}
    <ARViewer onPageDetected={handlePageDetected} />
    <AROverlay />
  {/if}

  <!-- Interactive Comic View with Hotspots -->
  {#if showInteractiveComic && selectedPageNumber !== null}
    <InteractiveComic
      pageNumber={selectedPageNumber}
      comicImageUrl={getComicImageUrl(selectedPageNumber)}
      hotspots={getHotspotsForPage(selectedPageNumber)}
      onHotspotClick={handleHotspotClick}
      onBack={handleBackToGrid}
    />
  {/if}

  <!-- 3D Model Viewer Modal -->
  <ModelViewerModal
    isOpen={isModelViewerOpen}
    modelUrl={selectedModelUrl}
    title={selectedModelTitle}
    onClose={handleCloseModelViewer}
  />
</div>
