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
  let selectedExplanation = $state('');
  let selectedAudioUrl = $state<string | undefined>(undefined);
  let currentHotspotIndex = $state(0);
  let currentPageHotspots = $state<ComicHotspot[]>([]);

  // Models served from /static/models/ and cached by service worker for offline PWA
  // Hotspot positions define interactive regions on each page image
  // Hotspot positions mapped from actual page image content
  // Hotspot positions verified against actual page images by visual analysis
  // arScale: per-model scale factor for 3D AR overlay (smaller for 4-model pages, larger for 1-2 model pages)
  const hotspotsMap: Record<number, ComicHotspot[]> = {
    // Page 1: Single hero — Lumi's spaceship
    1: [
      { id: 'alien', title: 'Meet Lumi', modelUrl: '/models/page-1/alien.glb', x: 25, y: 30, width: 25, height: 20, arScale: 0.30,
        explanation: "Hey there, Grade 7 students! We've officially landed on Planet Earth! Our mission is to explore the <strong>carbon cycle</strong> — how carbon moves through air, water, land, and living things to keep our planet in balance." }
    ],
    // Page 2: CO₂, cow, food web, photosynthesis
    2: [
      { id: 'co2-molecules', title: 'CO₂ Molecules', modelUrl: '/models/page-2/CO2 Model.glb', x: 25, y: 45, width: 20, height: 15, arScale: 0.20,
        explanation: "<strong>Carbon dioxide (CO₂)</strong> is one of the main greenhouse gases — gases that <strong>trap heat in the atmosphere</strong> and contribute to warming our planet." },
      { id: 'cow-photosynthesis', title: 'Cow & Photosynthesis', modelUrl: '/models/page-2/Cow eating grass.glb', x: 75, y: 45, width: 25, height: 18, arScale: 0.25,
        explanation: "Animals get carbon by <strong>eating plants or other animals</strong>, transferring carbon through the food web to build tissues and support growth." },
      { id: 'food-web', title: 'Ecosystem Food Web', modelUrl: '/models/page-2/Ecosystem (Food web).glb', x: 50, y: 78, width: 55, height: 22, arScale: 0.35,
        explanation: "Plant food — mainly <strong>sugar or starch</strong> — is passed on to consumers whose bodies break it down into forms they can <strong>readily absorb</strong>. This is how carbon moves through the food web." },
      { id: 'plant-co2', title: 'Plants & CO₂', modelUrl: '/models/page-2/Plant and CO2 Model.glb', x: 70, y: 22, width: 20, height: 10, arScale: 0.15,
        explanation: "Plants absorb carbon dioxide from the air and, using energy from sunlight, convert it into <strong>glucose</strong> through <strong>photosynthesis</strong>." }
    ],
    // Page 3: respiration, decomposition, carbon cycle
    3: [
      { id: 'plant-respiration', title: 'Plant Respiration', modelUrl: '/models/page-3/plant-respiration.glb', x: 65, y: 12, width: 18, height: 12, arScale: 0.15,
        explanation: "Plants release oxygen during photosynthesis in the daytime, but at night they respire like animals — <strong>taking in oxygen and releasing carbon dioxide</strong>." },
      { id: 'animal-respiration', title: 'Animal Respiration', modelUrl: '/models/page-3/animal-respiration.glb', x: 85, y: 14, width: 18, height: 12, arScale: 0.15,
        explanation: "Animals take in oxygen and release carbon dioxide during <strong>respiration</strong>, which happens <strong>day and night</strong> to provide energy for their bodies." },
      { id: 'dead-rabbit', title: 'Decomposition', modelUrl: '/models/page-3/dead-rabbit.glb', x: 42, y: 48, width: 22, height: 16, arScale: 0.20,
        explanation: "When plants and animals die, <strong>decomposers</strong> like bacteria and fungi break them down. During <strong>decomposition</strong>, carbon is released back into the soil and the air." },
      { id: 'carbon-cycle', title: 'Carbon Cycle', modelUrl: '/models/page-3/carbon-cycle.glb', x: 50, y: 82, width: 40, height: 20, arScale: 0.35,
        explanation: "The <strong>carbon cycle</strong> keeps going continuously — carbon moves between the atmosphere, living things, the ocean, and the ground in a never-ending loop." }
    ],
    // Page 4: deforestation, factory, mining
    4: [
      { id: 'deforestation', title: 'Deforestation', modelUrl: '/models/page-4/deforestation.glb', x: 75, y: 25, width: 25, height: 20, arScale: 0.25,
        explanation: "<strong>Deforestation:</strong> When large areas of trees are cut down, carbon dioxide builds up in the atmosphere and contributes to the <strong>greenhouse effect</strong>." },
      { id: 'factory', title: 'Factory Emissions', modelUrl: '/models/page-4/factory.glb', x: 25, y: 75, width: 25, height: 20, arScale: 0.25,
        explanation: "<strong>Fossil fuel combustion:</strong> Burning fossil fuels releases carbon stored underground as CO₂ <strong>far faster</strong> than natural processes can absorb it." },
      { id: 'mining-cart', title: 'Mining Cart', modelUrl: '/models/page-4/mining-cart.glb', x: 75, y: 75, width: 25, height: 20, arScale: 0.25,
        explanation: "<strong>Mining:</strong> The extraction, processing, and transportation of minerals contribute to greenhouse gas emissions. Surface mining releases stored CO₂, while underground mining can emit methane." }
    ],
    // Page 5: agriculture, urbanization, forest, waste
    5: [
      { id: 'agricultural-practices', title: 'Agricultural Practices', modelUrl: '/models/page-5/agricultural-practices.glb', x: 72, y: 20, width: 22, height: 16, arScale: 0.20,
        explanation: "<strong>Agricultural practices:</strong> Carbon is lost from soils when tillage equipment disturbs the soil, exposing it to a sudden supply of oxygen." },
      { id: 'city-building', title: 'Urbanization', modelUrl: '/models/page-5/city-building.glb', x: 25, y: 62, width: 22, height: 16, arScale: 0.20,
        explanation: "<strong>Land use changes:</strong> Clearing forests for agriculture or <strong>urban development</strong> releases stored carbon as CO₂ into the atmosphere." },
      { id: 'forest', title: 'Forest Land Use', modelUrl: '/models/page-5/forest.glb', x: 42, y: 58, width: 18, height: 14, arScale: 0.18,
        explanation: "Converting <strong>grasslands or wetlands</strong> to farmland can oxidize soil carbon, adding more CO₂ to the atmosphere and disrupting natural carbon storage." },
      { id: 'waste-management', title: 'Waste Management', modelUrl: '/models/page-5/waste-management.glb', x: 78, y: 82, width: 22, height: 16, arScale: 0.20,
        explanation: "<strong>Waste management:</strong> As waste decomposes in landfills, it releases <strong>methane (CH₄)</strong> and <strong>carbon dioxide (CO₂)</strong>, both potent greenhouse gases." }
    ],
    // Page 6: global warming, ocean acidification
    6: [
      { id: 'global-warming', title: 'Global Warming', modelUrl: '/models/page-6/global-warming.glb', x: 75, y: 25, width: 28, height: 22, arScale: 0.30,
        explanation: "<strong>Global warming</strong> refers to an increase in average global temperatures, caused primarily by greenhouse gases like carbon dioxide <strong>trapping heat</strong> in the atmosphere." },
      { id: 'ocean-acidification', title: 'Ocean Acidification', modelUrl: '/models/page-6/ocean-acidification.glb', x: 25, y: 75, width: 28, height: 22, arScale: 0.30,
        explanation: "<strong>Ocean acidification</strong> occurs as the ocean absorbs more CO₂ — the <strong>pH decreases</strong> and the water becomes more acidic, making it harder for corals, shells, and plankton to survive." }
    ],
    // Page 7: ecosystems — terrestrial, polar, marine, glaciers
    7: [
      { id: 'wilting-plant', title: 'Wilting Plant', modelUrl: '/models/page-7/wilting-plant.glb', x: 25, y: 25, width: 22, height: 18, arScale: 0.20,
        explanation: "<strong>Terrestrial ecosystems:</strong> Shifts in temperature affect plant growth and pollinators. Warm-tolerant invasive species may spread and threaten native plants. Some species may <strong>decline or become extinct</strong>." },
      { id: 'polar-bear', title: 'Polar Bear', modelUrl: '/models/page-7/polar-bear.glb', x: 75, y: 25, width: 22, height: 18, arScale: 0.20,
        explanation: "<strong>Polar regions:</strong> Global warming is melting ice caps and glaciers faster, <strong>reducing habitats</strong> for polar bears and penguins, while thawing permafrost releases more greenhouse gases." },
      { id: 'bleached-coral', title: 'Bleached Coral', modelUrl: '/models/page-7/bleached-coral.glb', x: 25, y: 75, width: 22, height: 18, arScale: 0.20,
        explanation: "<strong>Marine ecosystems:</strong> Ocean acidification eats away at the minerals used by oysters, clams, lobsters, and coral reefs to <strong>build their shells and skeletons</strong>." },
      { id: 'melting-glaciers', title: 'Melting Glaciers', modelUrl: '/models/page-7/melting-glaciers.glb', x: 75, y: 75, width: 22, height: 18, arScale: 0.20,
        explanation: "Melting <strong>glaciers and ice caps</strong> raise sea levels, threatening coastal communities and wildlife habitats around the world." }
    ],
    // Page 8: forest conservation, eco transport
    8: [
      { id: 'forest-conservation', title: 'Forest Conservation', modelUrl: '/models/page-8/forest-conservation.glb', x: 75, y: 25, width: 28, height: 22, arScale: 0.25,
        explanation: "<strong>Forest conservation:</strong> Through photosynthesis, trees remove CO₂ from the atmosphere. By protecting and planting trees, forests lock carbon in wood, roots, and soil — <strong>reducing heat-trapping gases</strong>." },
      { id: 'eco-friendly-transport', title: 'Eco-Friendly Transport', modelUrl: '/models/page-8/eco-friendly-transport.glb', x: 25, y: 75, width: 28, height: 22, arScale: 0.25,
        explanation: "<strong>Eco-friendly transport:</strong> Walking, biking, and electric vehicles <strong>help cut reliance on oil and coal</strong> and lower carbon emissions." }
    ],
    // Page 9: recycling, renewables, compost
    9: [
      { id: 'recycling-bin', title: 'Recycling Bin', modelUrl: '/models/page-9/recycling-bin.glb', x: 25, y: 32, width: 20, height: 16, arScale: 0.20,
        explanation: "<strong>Recycling</strong> reduces the energy needed to produce new products, lowering greenhouse gas emissions — even recycled paper helps by saving trees that absorb carbon." },
      { id: 'renewable-energy-source', title: 'Renewable Energy', modelUrl: '/models/page-9/renewable-energy-source.glb', x: 75, y: 25, width: 24, height: 18, arScale: 0.25,
        explanation: "<strong>Renewable energy</strong> is sustainable because fossil fuels will eventually run out, and renewables produce <strong>little to no CO₂</strong> or harmful pollutants once in use." },
      { id: 'compost-pit', title: 'Compost Pit', modelUrl: '/models/page-9/compost-pit.glb', x: 30, y: 75, width: 24, height: 18, arScale: 0.20,
        explanation: "<strong>Composting</strong> diverts food scraps from landfills, preventing the release of <strong>methane</strong>, a powerful greenhouse gas produced when food decomposes without oxygen." }
    ],
    // Page 10: sustainable agriculture, education
    10: [
      { id: 'cover-crops', title: 'Cover Crops', modelUrl: '/models/page-10/cover-crops.glb', x: 75, y: 25, width: 28, height: 22, arScale: 0.25,
        explanation: "<strong>Sustainable agriculture</strong> reduces carbon emissions by improving soil health. Practices like no-till farming, cover cropping, and crop rotation increase <strong>carbon-rich organic matter</strong> in the soil." },
      { id: 'students-classroom', title: 'Students in Classroom', modelUrl: '/models/page-10/students-classroom.glb', x: 25, y: 75, width: 28, height: 22, arScale: 0.25,
        explanation: "<strong>Environmental education</strong> is vital — parents and teachers help students become <strong>environmental stewards</strong> by encouraging outdoor learning and student environmental activism." }
    ],
    // Page 11: farewell
    11: [
      { id: 'goodbye-lumi', title: 'Goodbye Lumi', modelUrl: '/models/page-11/goodbye-lumi.glb', x: 55, y: 85, width: 35, height: 20, arScale: 0.35,
        explanation: "Thank you for joining our Earth adventure! Keep being curious, keep protecting Earth, and use your knowledge to make smart, <strong>planet-friendly choices</strong>. Bye for now, Earth heroes!" }
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
    selectedExplanation = hotspot.explanation ?? '';
    selectedAudioUrl = hotspot.audioUrl;
    isModelViewerOpen = true;
  }

  function handleNextHotspot() {
    if (currentHotspotIndex < currentPageHotspots.length - 1) {
      currentHotspotIndex += 1;
      const next = currentPageHotspots[currentHotspotIndex];
      selectedModelUrl = next.modelUrl;
      selectedModelTitle = next.title;
      selectedExplanation = next.explanation ?? '';
      selectedAudioUrl = next.audioUrl;
    }
  }

  function handleCloseModelViewer() {
    isModelViewerOpen = false;
    selectedModelUrl = '';
    selectedModelTitle = '';
    selectedExplanation = '';
    selectedAudioUrl = undefined;
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
    explanation={selectedExplanation}
    audioUrls={selectedAudioUrl ? [selectedAudioUrl] : detectedPage?.audioUrls}
    pageId={detectedPage?.id}
    hasNext={currentHotspotIndex < currentPageHotspots.length - 1}
    onClose={handleCloseModelViewer}
    onNext={handleNextHotspot}
  />
</div>
