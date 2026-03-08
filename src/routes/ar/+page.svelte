<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ARViewer, AROverlay, InteractiveComic, ModelViewerModal } from '$lib/components/ar';
  import { arStore } from '$lib/stores/ar.svelte';
  import { progressionStore } from '$lib/stores/progression.svelte';
  import { getStoryPages } from '$lib/utils/content';
  import type { StoryPage, ComicHotspot } from '$lib/types';

  // State
  let detectedPage = $state<StoryPage | null>(null);
  let showInteractiveComic = $state(false);
  let selectedPageNumber = $state<number | null>(null);
  let allPages = $state<StoryPage[]>([]);

  onMount(async () => {
    allPages = await getStoryPages();
  });

  // Model viewer modal state
  let isModelViewerOpen = $state(false);
  let selectedModelUrl = $state('');
  let selectedModelTitle = $state('');
  let currentHotspotIndex = $state(0);
  let currentPageHotspots = $state<ComicHotspot[]>([]);

  // Models served from /static/models/ and cached by service worker for offline PWA
  // Hotspot positions define interactive regions on each page image
  // Hotspot positions mapped from actual page image content
  // Hotspot positions verified against actual page images by visual analysis
  // arScale: per-model scale factor for 3D AR overlay (smaller for 4-model pages, larger for 1-2 model pages)
  const hotspotsMap: Record<number, ComicHotspot[]> = {
    // Page 1: Single hero — Lumi's spaceship in top-left panel
    1: [
      { id: 'alien', title: 'Meet Lumi', modelUrl: '/models/page-1/alien.glb', x: 25, y: 30, width: 25, height: 20, arScale: 0.30 }
    ],
    // Page 2: 3 rows — mid-left CO₂, mid-right cow, bottom food web, top-right photosynthesis
    2: [
      { id: 'co2-molecules', title: 'CO₂ Molecules', modelUrl: '/models/page-2/CO2 Model.glb', x: 25, y: 45, width: 20, height: 15, arScale: 0.20 },
      { id: 'cow-photosynthesis', title: 'Cow & Photosynthesis', modelUrl: '/models/page-2/Cow eating grass.glb', x: 75, y: 45, width: 25, height: 18, arScale: 0.25 },
      { id: 'food-web', title: 'Ecosystem Food Web', modelUrl: '/models/page-2/Ecosystem (Food web).glb', x: 50, y: 78, width: 55, height: 22, arScale: 0.35 },
      { id: 'plant-co2', title: 'Plants & CO₂', modelUrl: '/models/page-2/Plant and CO2 Model.glb', x: 70, y: 22, width: 20, height: 10, arScale: 0.15 }
    ],
    // Page 3: 3 rows — top: respiration thought bubbles, mid: decomposition, bottom: carbon cycle
    3: [
      { id: 'plant-respiration', title: 'Plant Respiration', modelUrl: '/models/page-3/plant-respiration.glb', x: 65, y: 12, width: 18, height: 12, arScale: 0.15 },
      { id: 'animal-respiration', title: 'Animal Respiration', modelUrl: '/models/page-3/animal-respiration.glb', x: 85, y: 14, width: 18, height: 12, arScale: 0.15 },
      { id: 'dead-rabbit', title: 'Decomposition', modelUrl: '/models/page-3/dead-rabbit.glb', x: 42, y: 48, width: 22, height: 16, arScale: 0.20 },
      { id: 'carbon-cycle', title: 'Carbon Cycle', modelUrl: '/models/page-3/carbon-cycle.glb', x: 50, y: 82, width: 40, height: 20, arScale: 0.35 }
    ],
    // Page 4: 2x2 — top-right deforestation, bottom-left factory, bottom-right mining
    4: [
      { id: 'deforestation', title: 'Deforestation', modelUrl: '/models/page-4/deforestation.glb', x: 75, y: 25, width: 25, height: 20, arScale: 0.25 },
      { id: 'factory', title: 'Factory Emissions', modelUrl: '/models/page-4/factory.glb', x: 25, y: 75, width: 25, height: 20, arScale: 0.25 },
      { id: 'mining-cart', title: 'Mining Cart', modelUrl: '/models/page-4/mining-cart.glb', x: 75, y: 75, width: 25, height: 20, arScale: 0.25 }
    ],
    // Page 5: 6 panels — positions refined from visual analysis
    5: [
      { id: 'agricultural-practices', title: 'Agricultural Practices', modelUrl: '/models/page-5/agricultural-practices.glb', x: 72, y: 20, width: 22, height: 16, arScale: 0.20 },
      { id: 'city-building', title: 'Urbanization', modelUrl: '/models/page-5/city-building.glb', x: 25, y: 62, width: 22, height: 16, arScale: 0.20 },
      { id: 'forest', title: 'Forest Land Use', modelUrl: '/models/page-5/forest.glb', x: 42, y: 58, width: 18, height: 14, arScale: 0.18 },
      { id: 'waste-management', title: 'Waste Management', modelUrl: '/models/page-5/waste-management.glb', x: 78, y: 82, width: 22, height: 16, arScale: 0.20 }
    ],
    // Page 6: 2x2 — top-right global warming, bottom-left ocean acidification
    6: [
      { id: 'global-warming', title: 'Global Warming', modelUrl: '/models/page-6/global-warming.glb', x: 75, y: 25, width: 28, height: 22, arScale: 0.30 },
      { id: 'ocean-acidification', title: 'Ocean Acidification', modelUrl: '/models/page-6/ocean-acidification.glb', x: 25, y: 75, width: 28, height: 22, arScale: 0.30 }
    ],
    // Page 7: 2x2 — all four corners
    7: [
      { id: 'wilting-plant', title: 'Wilting Plant', modelUrl: '/models/page-7/wilting-plant.glb', x: 25, y: 25, width: 22, height: 18, arScale: 0.20 },
      { id: 'polar-bear', title: 'Polar Bear', modelUrl: '/models/page-7/polar-bear.glb', x: 75, y: 25, width: 22, height: 18, arScale: 0.20 },
      { id: 'bleached-coral', title: 'Bleached Coral', modelUrl: '/models/page-7/bleached-coral.glb', x: 25, y: 75, width: 22, height: 18, arScale: 0.20 },
      { id: 'melting-glaciers', title: 'Melting Glaciers', modelUrl: '/models/page-7/melting-glaciers.glb', x: 75, y: 75, width: 22, height: 18, arScale: 0.20 }
    ],
    // Page 8: 2x2 — top-right reforestation, bottom-left eco transport
    8: [
      { id: 'forest-conservation', title: 'Forest Conservation', modelUrl: '/models/page-8/forest-conservation.glb', x: 75, y: 25, width: 28, height: 22, arScale: 0.25 },
      { id: 'eco-friendly-transport', title: 'Eco-Friendly Transport', modelUrl: '/models/page-8/eco-friendly-transport.glb', x: 25, y: 75, width: 28, height: 22, arScale: 0.25 }
    ],
    // Page 9: 3 panels — recycling top-left, renewables top-right, compost bottom-left
    9: [
      { id: 'recycling-bin', title: 'Recycling Bin', modelUrl: '/models/page-9/recycling-bin.glb', x: 25, y: 32, width: 20, height: 16, arScale: 0.20 },
      { id: 'renewable-energy-source', title: 'Renewable Energy', modelUrl: '/models/page-9/renewable-energy-source.glb', x: 75, y: 25, width: 24, height: 18, arScale: 0.25 },
      { id: 'compost-pit', title: 'Compost Pit', modelUrl: '/models/page-9/compost-pit.glb', x: 30, y: 75, width: 24, height: 18, arScale: 0.20 }
    ],
    // Page 10: 2x2 — top-right farm/barn, bottom-left classroom
    10: [
      { id: 'cover-crops', title: 'Cover Crops', modelUrl: '/models/page-10/cover-crops.glb', x: 75, y: 25, width: 28, height: 22, arScale: 0.25 },
      { id: 'students-classroom', title: 'Students in Classroom', modelUrl: '/models/page-10/students-classroom.glb', x: 25, y: 75, width: 28, height: 22, arScale: 0.25 }
    ],
    // Page 11: Full-width bottom panel — Lumi's spaceship departing Earth
    11: [
      { id: 'goodbye-lumi', title: 'Goodbye Lumi', modelUrl: '/models/page-11/goodbye-lumi.glb', x: 55, y: 85, width: 35, height: 20, arScale: 0.35 }
    ]
  };

  // Get hotspots for a specific page
  function getHotspotsForPage(pageNumber: number): ComicHotspot[] {
    return hotspotsMap[pageNumber] ?? [];
  }

  // Get comic image URL for a page
  function getComicImageUrl(pageNumber: number): string {
    return `/pages/Page ${pageNumber}.webp`;
  }

  function handlePageDetected(page: StoryPage) {
    detectedPage = page;
    selectedPageNumber = page.id;

    // Mark this page as viewed so its quiz becomes unlocked
    progressionStore.markPageViewed(page.id);

    // For pages with hotspots, show interactive comic
    const hotspots = getHotspotsForPage(page.id);
    if (hotspots.length > 0) {
      showInteractiveComic = true;
    }
  }

  function handleHotspotClick(hotspot: ComicHotspot) {
    // Track all hotspots for the current page so NEXT can cycle through them
    if (selectedPageNumber !== null) {
      currentPageHotspots = getHotspotsForPage(selectedPageNumber);
      currentHotspotIndex = currentPageHotspots.findIndex(h => h.id === hotspot.id);
    }
    selectedModelUrl = hotspot.modelUrl;
    selectedModelTitle = hotspot.title;
    isModelViewerOpen = true;
  }

  function handleNextHotspot() {
    if (currentHotspotIndex < currentPageHotspots.length - 1) {
      currentHotspotIndex += 1;
      const next = currentPageHotspots[currentHotspotIndex];
      selectedModelUrl = next.modelUrl;
      selectedModelTitle = next.title;
    }
  }

  function handleCloseModelViewer() {
    isModelViewerOpen = false;
    selectedModelUrl = '';
    selectedModelTitle = '';
    currentHotspotIndex = 0;
    currentPageHotspots = [];
  }

  function handleNextPage() {
    if (selectedPageNumber === null) return;
    const nextPage = selectedPageNumber + 1;
    if (!hotspotsMap[nextPage]) return;

    selectedPageNumber = nextPage;
    progressionStore.markPageViewed(nextPage);

    // Load full page data for audio/explanation
    const pageData = allPages.find(p => p.id === nextPage);
    if (pageData) detectedPage = pageData;
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
    <ARViewer onPageDetected={handlePageDetected} hotspotsMap={hotspotsMap} />
    <AROverlay />
  {/if}

  <!-- Interactive Comic View with Hotspots -->
  {#if showInteractiveComic && selectedPageNumber !== null}
    <InteractiveComic
      pageNumber={selectedPageNumber}
      comicImageUrl={getComicImageUrl(selectedPageNumber)}
      hotspots={getHotspotsForPage(selectedPageNumber)}
      audioUrls={detectedPage?.audioUrls}
      onHotspotClick={handleHotspotClick}
      onBack={handleBackToGrid}
      hasNextPage={!!hotspotsMap[selectedPageNumber + 1]}
      onNextPage={handleNextPage}
    />
  {/if}

  <!-- 3D Model Viewer Modal -->
  <ModelViewerModal
    isOpen={isModelViewerOpen}
    modelUrl={selectedModelUrl}
    title={selectedModelTitle}
    explanation={detectedPage?.explanation}
    audioUrls={detectedPage?.audioUrls}
    pageId={detectedPage?.id}
    hasNext={currentHotspotIndex < currentPageHotspots.length - 1}
    onClose={handleCloseModelViewer}
    onNext={handleNextHotspot}
  />
</div>
