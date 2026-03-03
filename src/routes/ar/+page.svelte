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

  // Models served from /static/models/ and cached by service worker for offline PWA
  // Hotspot positions define interactive regions on each page image
  // Hotspot positions mapped from actual page image content
  const hotspotsMap: Record<number, ComicHotspot[]> = {
    // Page 1: 2x2 grid — spaceship top-left, Earth hologram top-right, rocket bottom-left, landing bottom-right
    1: [
      { id: 'alien', title: 'Meet Lumi', modelUrl: '/models/page-1/alien.glb', x: 25, y: 30, width: 25, height: 20 }
    ],
    // Page 2: Already verified positions from original implementation
    2: [
      { id: 'co2-molecules', title: 'CO₂ Molecules', modelUrl: '/models/page-2/CO2 Model.glb', x: 25, y: 45, width: 20, height: 15 },
      { id: 'cow-photosynthesis', title: 'Cow & Photosynthesis', modelUrl: '/models/page-2/Cow eating grass.glb', x: 75, y: 45, width: 25, height: 18 },
      { id: 'food-web', title: 'Ecosystem Food Web', modelUrl: '/models/page-2/Ecosystem (Food web).glb', x: 50, y: 78, width: 55, height: 22 },
      { id: 'plant-co2', title: 'Plants & CO₂', modelUrl: '/models/page-2/Plant and CO2 Model.glb', x: 70, y: 18, width: 20, height: 10 }
    ],
    // Page 3: 3 rows — top: respiration (plant top-right, dog/animal far-right), mid: decomposition, bottom: carbon cycle diagram
    3: [
      { id: 'plant-respiration', title: 'Plant Respiration', modelUrl: '/models/page-3/plant-respiration.glb', x: 65, y: 12, width: 18, height: 12 },
      { id: 'animal-respiration', title: 'Animal Respiration', modelUrl: '/models/page-3/animal-respiration.glb', x: 85, y: 14, width: 18, height: 12 },
      { id: 'dead-rabbit', title: 'Decomposition', modelUrl: '/models/page-3/dead-rabbit.glb', x: 42, y: 48, width: 22, height: 16 },
      { id: 'carbon-cycle', title: 'Carbon Cycle', modelUrl: '/models/page-3/carbon-cycle.glb', x: 50, y: 82, width: 40, height: 20 }
    ],
    // Page 4: 2x2 — top-left: dialogue, top-right: deforestation stumps, bottom-left: factory, bottom-right: mining cave
    4: [
      { id: 'deforestation', title: 'Deforestation', modelUrl: '/models/page-4/deforestation.glb', x: 75, y: 25, width: 25, height: 20 },
      { id: 'factory', title: 'Factory Emissions', modelUrl: '/models/page-4/factory.glb', x: 25, y: 75, width: 25, height: 20 },
      { id: 'mining-cart', title: 'Mining Cart', modelUrl: '/models/page-4/mining-cart.glb', x: 75, y: 75, width: 25, height: 20 }
    ],
    // Page 5: 6 panels — top-right: farming/cows, mid-left: city buildings, mid-right: land use, bottom-right: waste/factory
    5: [
      { id: 'agricultural-practices', title: 'Agricultural Practices', modelUrl: '/models/page-5/agricultural-practices.glb', x: 72, y: 18, width: 22, height: 16 },
      { id: 'city-building', title: 'Urbanization', modelUrl: '/models/page-5/city-building.glb', x: 25, y: 58, width: 22, height: 16 },
      { id: 'forest', title: 'Forest Land Use', modelUrl: '/models/page-5/forest.glb', x: 55, y: 58, width: 18, height: 14 },
      { id: 'waste-management', title: 'Waste Management', modelUrl: '/models/page-5/waste-management.glb', x: 78, y: 80, width: 22, height: 16 }
    ],
    // Page 6: 2x2 — top-right: glowing Earth (global warming), bottom-left: CO₂ into ocean (acidification)
    6: [
      { id: 'global-warming', title: 'Global Warming', modelUrl: '/models/page-6/global-warming.glb', x: 75, y: 25, width: 28, height: 22 },
      { id: 'ocean-acidification', title: 'Ocean Acidification', modelUrl: '/models/page-6/ocean-acidification.glb', x: 25, y: 75, width: 28, height: 22 }
    ],
    // Page 7: 2x2 — top-left: wilting plant, top-right: polar bear, bottom-left: coral reef, bottom-right: glaciers/penguins
    7: [
      { id: 'wilting-plant', title: 'Wilting Plant', modelUrl: '/models/page-7/wilting-plant.glb', x: 25, y: 25, width: 22, height: 18 },
      { id: 'polar-bear', title: 'Polar Bear', modelUrl: '/models/page-7/polar-bear.glb', x: 75, y: 25, width: 22, height: 18 },
      { id: 'bleached-coral', title: 'Bleached Coral', modelUrl: '/models/page-7/bleached-coral.glb', x: 25, y: 75, width: 22, height: 18 },
      { id: 'melting-glaciers', title: 'Melting Glaciers', modelUrl: '/models/page-7/melting-glaciers.glb', x: 75, y: 75, width: 22, height: 18 }
    ],
    // Page 8: 2x2 — top-right: forest/reforestation, bottom-left: biking/eco-transport
    8: [
      { id: 'forest-conservation', title: 'Forest Conservation', modelUrl: '/models/page-8/forest-conservation.glb', x: 75, y: 25, width: 28, height: 22 },
      { id: 'eco-friendly-transport', title: 'Eco-Friendly Transport', modelUrl: '/models/page-8/eco-friendly-transport.glb', x: 25, y: 75, width: 28, height: 22 }
    ],
    // Page 9: 2x2 — top-left: solar panels + recycling bins, top-right: wind turbines, bottom-left: composting
    9: [
      { id: 'recycling-bin', title: 'Recycling Bin', modelUrl: '/models/page-9/recycling-bin.glb', x: 22, y: 32, width: 20, height: 16 },
      { id: 'renewable-energy-source', title: 'Renewable Energy', modelUrl: '/models/page-9/renewable-energy-source.glb', x: 75, y: 25, width: 24, height: 18 },
      { id: 'compost-pit', title: 'Compost Pit', modelUrl: '/models/page-9/compost-pit.glb', x: 30, y: 75, width: 24, height: 18 }
    ],
    // Page 10: 2x2 — top-right: farming/cover crops with barn, bottom-left: classroom scene
    10: [
      { id: 'cover-crops', title: 'Cover Crops', modelUrl: '/models/page-10/cover-crops.glb', x: 75, y: 25, width: 28, height: 22 },
      { id: 'students-classroom', title: 'Students in Classroom', modelUrl: '/models/page-10/students-classroom.glb', x: 25, y: 75, width: 28, height: 22 }
    ],
    // Page 11: 3 rows — top: reflection, middle: farewell, bottom: spaceship leaving Earth
    11: [
      { id: 'goodbye-lumi', title: 'Goodbye Lumi', modelUrl: '/models/page-11/goodbye-lumi.glb', x: 50, y: 85, width: 35, height: 20 }
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
      audioUrl={detectedPage?.audioUrl}
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
