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
        explanation: "Hey there, Grade 7 students! We've officially landed on Planet Earth, and I'm so excited you're here with me!<br><br>Now that we're on the ground, our mission is to explore one of Earth's most important cycles — the carbon cycle. We will discover how carbon moves through air, water, land, and living things to keep our planet in balance.<br><br>So… are you ready to begin our Earth adventure? Let's start exploring!" }
    ],
    // Page 2: CO₂, cow, food web, photosynthesis
    2: [
      { id: 'co2-molecules', title: 'CO₂ Molecules', modelUrl: '/models/page-2/CO2 Model.glb', x: 25, y: 45, width: 20, height: 15, arScale: 0.20,
        explanation: "Let's talk about carbon dioxide — one of the main greenhouse gases. These are gases that trap heat in the atmosphere, acting like a blanket around our planet." },
      { id: 'cow-photosynthesis', title: 'Cow & Photosynthesis', modelUrl: '/models/page-2/Cow eating grass.glb', x: 75, y: 45, width: 25, height: 18, arScale: 0.25,
        explanation: "Animals get carbon by eating plants or other animals, transferring carbon through the food web. This carbon is used to build their tissues and support their growth." },
      { id: 'food-web', title: 'Ecosystem Food Web', modelUrl: '/models/page-2/Ecosystem (Food web).glb', x: 50, y: 78, width: 55, height: 22, arScale: 0.35,
        explanation: "And the food keeps moving! Plant food — mainly sugar or starch — is passed on to consumers like humans and animals. Their bodies break it down into forms they can readily absorb. Carbon is always on the move, connecting every living thing on Earth!" },
      { id: 'plant-co2', title: 'Plants & CO₂', modelUrl: '/models/page-2/Plant and CO2 Model.glb', x: 70, y: 22, width: 20, height: 10, arScale: 0.15,
        explanation: "Now, plants are amazing! They absorb carbon dioxide from the air. Using energy from sunlight, they convert that carbon dioxide into glucose — a type of food — through a process called photosynthesis." }
    ],
    // Page 3: respiration, decomposition, carbon cycle
    3: [
      { id: 'plant-respiration', title: 'Plant Respiration', modelUrl: '/models/page-3/plant-respiration.glb', x: 65, y: 12, width: 18, height: 12, arScale: 0.15,
        explanation: "Plants are a little different. They release oxygen and absorb carbon dioxide during photosynthesis in the daytime. But at night, when photosynthesis stops, plants respire just like animals — taking in oxygen and releasing carbon dioxide back into the air." },
      { id: 'animal-respiration', title: 'Animal Respiration', modelUrl: '/models/page-3/animal-respiration.glb', x: 85, y: 14, width: 18, height: 12, arScale: 0.15,
        explanation: "Did you know all living things release carbon dioxide? It happens through respiration. Animals take in oxygen and release carbon dioxide during respiration — and this happens day and night, without stopping." },
      { id: 'dead-rabbit', title: 'Decomposition', modelUrl: '/models/page-3/dead-rabbit.glb', x: 42, y: 48, width: 22, height: 16, arScale: 0.20,
        explanation: "Now, what happens when living things die? Their bodies still contain carbon molecules. That's where decomposers come in — tiny organisms like bacteria and fungi. They break down dead plants and animals through a process called decomposition, releasing carbon back into the soil and the air." },
      { id: 'carbon-cycle', title: 'Carbon Cycle', modelUrl: '/models/page-3/carbon-cycle.glb', x: 50, y: 82, width: 40, height: 20, arScale: 0.35,
        explanation: "This is what makes the carbon cycle continuous. Carbon never disappears — it just keeps moving." }
    ],
    // Page 4: deforestation, factory, mining
    4: [
      { id: 'deforestation', title: 'Deforestation', modelUrl: '/models/page-4/deforestation.glb', x: 75, y: 25, width: 25, height: 20, arScale: 0.25,
        explanation: "One major disruption is deforestation. When large areas of trees are cut down, less carbon dioxide is removed from the atmosphere. And when those trees are burned or left to decay, even more carbon is released. This build-up contributes to the greenhouse effect." },
      { id: 'factory', title: 'Factory Emissions', modelUrl: '/models/page-4/factory.glb', x: 25, y: 75, width: 25, height: 20, arScale: 0.25,
        explanation: "Then there's fossil fuel combustion. Fossil fuels — like coal, oil, and gas — formed from buried photosynthetic organisms over millions of years, slowly storing carbon underground. When we burn them, that carbon is released back as carbon dioxide far faster than natural processes can absorb it." },
      { id: 'mining-cart', title: 'Mining Cart', modelUrl: '/models/page-4/mining-cart.glb', x: 75, y: 75, width: 25, height: 20, arScale: 0.25,
        explanation: "Mining also affects the carbon cycle. The extraction, processing, and transportation of minerals all produce greenhouse gas emissions. Surface mining clears large areas of land and releases stored carbon dioxide, while underground mining uses high amounts of energy and can emit methane." }
    ],
    // Page 5: agriculture, urbanization, forest, waste
    5: [
      { id: 'agricultural-practices', title: 'Agricultural Practices', modelUrl: '/models/page-5/agricultural-practices.glb', x: 72, y: 20, width: 22, height: 16, arScale: 0.20,
        explanation: "Agricultural practices play a big role. Carbon is lost from soils when they are exposed to a sudden supply of oxygen — like when tillage equipment disturbs or turns over the soil. Livestock also produce carbon-rich gases as they digest their food." },
      { id: 'city-building', title: 'Urbanization', modelUrl: '/models/page-5/city-building.glb', x: 25, y: 62, width: 22, height: 16, arScale: 0.20,
        explanation: "Land use changes are another major factor. Clearing forests for agriculture or urban development releases stored carbon as carbon dioxide." },
      { id: 'forest', title: 'Forest Land Use', modelUrl: '/models/page-5/forest.glb', x: 42, y: 58, width: 18, height: 14, arScale: 0.18,
        explanation: "Converting grasslands or wetlands to farmland can also oxidize soil carbon, adding even more carbon dioxide to the atmosphere. Fewer plants means less carbon being absorbed." },
      { id: 'waste-management', title: 'Waste Management', modelUrl: '/models/page-5/waste-management.glb', x: 78, y: 82, width: 22, height: 16, arScale: 0.20,
        explanation: "And don't forget waste management. As waste decomposes in landfills, it releases methane and carbon dioxide — both powerful greenhouse gases. Incineration, or burning waste, also releases large amounts of carbon dioxide." }
    ],
    // Page 6: global warming, ocean acidification
    6: [
      { id: 'global-warming', title: 'Global Warming', modelUrl: '/models/page-6/global-warming.glb', x: 75, y: 25, width: 28, height: 22, arScale: 0.30,
        explanation: "Let's start with global warming. When excess carbon dioxide enters the atmosphere, it traps heat — like a thickening blanket around the Earth. This is called the greenhouse effect, and it leads to global warming. Warmer temperatures change weather patterns, melt ice caps, and affect the plants and animals that depend on stable conditions." },
      { id: 'ocean-acidification', title: 'Ocean Acidification', modelUrl: '/models/page-6/ocean-acidification.glb', x: 25, y: 75, width: 28, height: 22, arScale: 0.30,
        explanation: "But carbon dioxide doesn't just stay in the air. The oceans absorb it too. As the ocean continues to take in more and more carbon dioxide, its pH decreases — meaning the water becomes more acidic. This is called ocean acidification. Shells, coral reefs, and plankton struggle to survive in acidic water, which threatens entire marine food chains." }
    ],
    // Page 7: ecosystems — terrestrial, polar, marine, glaciers
    7: [
      { id: 'wilting-plant', title: 'Wilting Plant', modelUrl: '/models/page-7/wilting-plant.glb', x: 25, y: 25, width: 22, height: 18, arScale: 0.20,
        explanation: "On land, plants and animals are adapted to specific temperatures and carbon levels. Shifts in temperature, precipitation, and moisture affect plant growth and pollinators. Warm-tolerant and invasive species may spread, threatening native plants. Some species may decline or even become extinct if they cannot adapt quickly enough." },
      { id: 'polar-bear', title: 'Polar Bear', modelUrl: '/models/page-7/polar-bear.glb', x: 75, y: 25, width: 22, height: 18, arScale: 0.20,
        explanation: "In polar regions, global warming is melting glaciers and ice caps faster than ever. This reduces habitats for species like polar bears and penguins. Thawing permafrost also releases greenhouse gases like carbon dioxide and methane, making warming even worse." },
      { id: 'bleached-coral', title: 'Bleached Coral', modelUrl: '/models/page-7/bleached-coral.glb', x: 25, y: 75, width: 22, height: 18, arScale: 0.20,
        explanation: "In the oceans, warming and acidification threaten marine ecosystems. Ocean acidification eats away at the minerals that oysters, clams, lobsters, and coral reefs use to build their shells and skeletons. When corals and plankton suffer, the whole marine food chain is affected." },
      { id: 'melting-glaciers', title: 'Melting Glaciers', modelUrl: '/models/page-7/melting-glaciers.glb', x: 75, y: 75, width: 22, height: 18, arScale: 0.20,
        explanation: "Warming reshapes ecosystems everywhere — on land, in the sea, and at the poles." }
    ],
    // Page 8: forest conservation, eco transport
    8: [
      { id: 'forest-conservation', title: 'Forest Conservation', modelUrl: '/models/page-8/forest-conservation.glb', x: 75, y: 25, width: 28, height: 22, arScale: 0.25,
        explanation: "One key strategy is forest conservation. Through photosynthesis, trees remove carbon dioxide from the atmosphere and release oxygen. By protecting and planting trees, we lock carbon pollution in wood, roots, and soil — reducing heat-trapping gases and helping regulate Earth's temperature." },
      { id: 'eco-friendly-transport', title: 'Eco-Friendly Transport', modelUrl: '/models/page-8/eco-friendly-transport.glb', x: 25, y: 75, width: 28, height: 22, arScale: 0.25,
        explanation: "Another strategy is eco-friendly transportation. Walking, biking, using public transport, or switching to electric vehicles reduces carbon emissions from fossil fuels. Fewer emissions means the carbon cycle can stay more balanced." }
    ],
    // Page 9: recycling, renewables, compost
    9: [
      { id: 'recycling-bin', title: 'Recycling Bin', modelUrl: '/models/page-9/recycling-bin.glb', x: 25, y: 32, width: 20, height: 16, arScale: 0.20,
        explanation: "Responsible waste management also makes a big difference. Recycling reduces the energy needed to produce and transport new products, lowering greenhouse gas emissions. Even small actions — like using recycled paper — help by saving trees that absorb carbon and fight climate change." },
      { id: 'renewable-energy-source', title: 'Renewable Energy', modelUrl: '/models/page-9/renewable-energy-source.glb', x: 75, y: 25, width: 24, height: 18, arScale: 0.25,
        explanation: "Renewable energy is a powerful solution. Sources like solar, wind, and hydropower are sustainable — because unlike fossil fuels, they won't run out. And once in use, they produce little to no carbon dioxide or harmful pollutants." },
      { id: 'compost-pit', title: 'Compost Pit', modelUrl: '/models/page-9/compost-pit.glb', x: 30, y: 75, width: 24, height: 18, arScale: 0.20,
        explanation: "Composting is another smart choice. When food waste decomposes in landfills without oxygen, it releases methane — a very powerful greenhouse gas. By composting food scraps instead of sending them to landfills, we significantly reduce that harmful gas." }
    ],
    // Page 10: sustainable agriculture, education
    10: [
      { id: 'cover-crops', title: 'Cover Crops', modelUrl: '/models/page-10/cover-crops.glb', x: 75, y: 25, width: 28, height: 22, arScale: 0.25,
        explanation: "Sustainable agriculture is one important approach. Healthy soil is not just for growing food — it also acts as a carbon sink, storing carbon that would otherwise enter the atmosphere. Practices like no-till farming, cover cropping, and crop rotation increase carbon-rich organic matter in the soil and help keep the carbon cycle balanced." },
      { id: 'students-classroom', title: 'Students in Classroom', modelUrl: '/models/page-10/students-classroom.glb', x: 25, y: 75, width: 28, height: 22, arScale: 0.25,
        explanation: "Environmental education is just as crucial. Without understanding how systems like the carbon cycle work, the leaders of tomorrow will be ill-equipped to face environmental challenges. Parents and teachers play a huge role — encouraging outdoor learning, supporting student environmental activism, and helping young people see themselves as environmental stewards." }
    ],
    // Page 11: farewell
    11: [
      { id: 'goodbye-lumi', title: 'Goodbye Lumi', modelUrl: '/models/page-11/goodbye-lumi.glb', x: 55, y: 85, width: 35, height: 20, arScale: 0.35,
        explanation: "What an incredible journey we've been on together!<br><br>We've seen how humans have such a big impact on Earth — from cutting forests, to burning fossil fuels, to farming the land. But we've also seen hope. Protecting forests, using clean energy, managing waste responsibly, and learning about the environment — these all help restore balance.<br><br>Keep using your knowledge to make smart, planet-friendly choices. Goodbye, Grade 7 Earth heroes — and thank you for exploring with me!" }
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
