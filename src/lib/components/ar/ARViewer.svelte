<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { env } from '$env/dynamic/public';
  import { arStore } from '$lib/stores/ar.svelte';
  import { getStoryPages } from '$lib/utils/content';
  import { sfx } from '$lib/utils';
  import type { StoryPage, ComicHotspot } from '$lib/types';
  import Icon from '@iconify/svelte';

  const forceDemo = env.PUBLIC_AR_DEMO_MODE === 'true';

  interface Props {
    targetSrc?: string;
    onPageDetected?: (page: StoryPage) => void;
    hotspotsMap?: Record<number, ComicHotspot[]>;
  }

  let { targetSrc = '/targets/storybook.mind', onPageDetected, hotspotsMap }: Props = $props();

  let container: HTMLDivElement;
  let isLoading = $state(true);
  let loadingMessage = $state('Initializing camera...');
  let pages = $state<StoryPage[]>([]);
  let mindarInstance: any = null;
  let animationFrameId: number | null = null;

  // Demo mode for testing without actual targets
  let demoMode = $state(false);
  let demoPageIndex = $state(0);

  // 3D model overlay tracking
  const loadedModels = new Map<number, any[]>(); // pageId -> THREE.Group[]
  let threeModule: any = null; // cached THREE namespace
  let dracoLoaderRef: any = null; // cached for cleanup

  async function loadModelsForAnchor(loader: any, anchor: any, hotspots: ComicHotspot[], pageId: number) {
    if (!threeModule) return;

    if (loadedModels.has(pageId)) {
      // Re-show cached models
      const cached = loadedModels.get(pageId)!;
      cached.forEach((m: any) => {
        m.visible = true;
        anchor.group.add(m);
      });
      return;
    }

    const models: any[] = [];
    for (const hotspot of hotspots) {
      try {
        const gltf: any = await new Promise((resolve, reject) => {
          loader.load(hotspot.modelUrl, resolve, undefined, reject);
        });
        const model = gltf.scene;

        // Position at hotspot location in MindAR coordinate space
        // MindAR image target width = 1.0 unit
        // Page images are 848x1200 (aspect ratio ~1.415)
        const x = (hotspot.x / 100 - 0.5);
        const y = -(hotspot.y / 100 - 0.5) * 1.415;
        model.position.set(x, y, 0.1);

        // Scale model to fit panel (normalize based on bounding box)
        const box = new threeModule.Box3().setFromObject(model);
        const size = new threeModule.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = hotspot.arScale ?? 0.15;
        const scale = maxDim > 0 ? targetScale / maxDim : targetScale;
        model.scale.setScalar(scale);

        anchor.group.add(model);
        models.push(model);
      } catch (err) {
        console.warn(`Failed to load model ${hotspot.modelUrl}:`, err);
      }
    }
    loadedModels.set(pageId, models);
  }

  function clearAnchorModels(anchor: any) {
    while (anchor.group.children.length > 0) {
      anchor.group.remove(anchor.group.children[0]);
    }
  }

  function disposeLoadedModels() {
    loadedModels.forEach((models) => {
      models.forEach((model: any) => {
        model.traverse((child: any) => {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      });
    });
    loadedModels.clear();
  }

  async function checkCameraPermission(): Promise<boolean> {
    try {
      // Add timeout to prevent hanging in headless browsers
      const timeoutPromise = new Promise<MediaStream>((_, reject) => {
        setTimeout(() => reject(new Error('Camera timeout')), 5000);
      });

      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        }),
        timeoutPromise
      ]);
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  async function waitForMindAR(maxWait = 10000): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      const MindARThree = (window as any).MINDAR?.IMAGE?.MindARThree;
      if (MindARThree) return MindARThree;
      await new Promise(r => setTimeout(r, 200));
    }
    return null;
  }

  async function initializeAR() {
    loadingMessage = 'Loading AR engine...';

    // Wait for MindAR CDN module to finish loading
    const MindARThree = await waitForMindAR();

    if (!MindARThree) {
      console.warn('MindAR not loaded after timeout, enabling demo mode');
      demoMode = true;
      isLoading = false;
      arStore.setInitialized(true);
      return;
    }

    try {
      loadingMessage = 'Starting AR session...';

      mindarInstance = new MindARThree({
        container,
        imageTargetSrc: targetSrc,
        maxTrack: pages.length || 10,
        filterMinCF: 0.001,
        filterBeta: 100,
        missTolerance: 5,
        warmupTolerance: 5,
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no',
      });

      const { renderer, scene, camera } = mindarInstance;

      // Add lighting to the scene for 3D models
      // Runtime-only imports: Three.js + loaders resolve via importmap, not bundled by Vite
      // Using variables prevents Rollup from trying to resolve these at build time
      const runtimeImport = (p: string) => new Function('p', 'return import(p)')(p);
      threeModule = await runtimeImport('three');
      const ambientLight = new threeModule.AmbientLight(0xffffff, 1.0);
      scene.add(ambientLight);
      const directionalLight = new threeModule.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0.5, 1, 0.5);
      scene.add(directionalLight);

      // GLTFLoader + DRACOLoader for 3D model loading (all models use Draco compression)
      const { GLTFLoader } = await runtimeImport('/lib/three/addons/loaders/GLTFLoader.js');
      const { DRACOLoader } = await runtimeImport('/lib/three/addons/loaders/DRACOLoader.js');
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/lib/three/addons/libs/draco/gltf/');
      dracoLoaderRef = dracoLoader;
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      // Create anchors for each page
      for (let i = 0; i < pages.length; i++) {
        const anchor = mindarInstance.addAnchor(i);

        anchor.onTargetFound = () => {
          arStore.onTargetFound(i);
          sfx.arDetect();
          if (pages[i] && onPageDetected) {
            onPageDetected(pages[i]);
          }

          // Load 3D models for this page
          const pageId = pages[i]?.id;
          if (pageId != null) {
            const hotspots = hotspotsMap?.[pageId] || [];
            if (hotspots.length > 0) {
              loadModelsForAnchor(loader, anchor, hotspots, pageId);
            }
          }
        };

        anchor.onTargetLost = () => {
          arStore.onTargetLost();
          // Remove models when target lost (they'll be re-added from cache on next find)
          clearAnchorModels(anchor);
        };
      }

      await mindarInstance.start();

      // Animation loop
      const animate = () => {
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();

      arStore.setInitialized(true);
      isLoading = false;
    } catch (err) {
      console.error('AR initialization failed:', err);
      arStore.setError((err as Error).message);
      // Fall back to demo mode
      demoMode = true;
      isLoading = false;
      arStore.setInitialized(true);
    }
  }

  function handleDemoPageSelect(index: number) {
    demoPageIndex = index;
    arStore.onTargetFound(index);
    if (pages[index] && onPageDetected) {
      onPageDetected(pages[index]);
    }
  }

  function handleDemoClose() {
    arStore.onTargetLost();
  }

  onMount(async () => {
    // Load pages first
    pages = await getStoryPages();

    // Check demo mode flag
    if (forceDemo) {
      console.log('AR demo mode enabled via PUBLIC_AR_DEMO_MODE');
      demoMode = true;
      isLoading = false;
      arStore.setInitialized(true);
      return;
    }

    // Check camera permission
    loadingMessage = 'Checking camera access...';
    const hasPermission = await checkCameraPermission();

    if (!hasPermission) {
      // Fall back to demo mode instead of blocking
      console.warn('Camera permission denied or unavailable, enabling demo mode');
      demoMode = true;
      isLoading = false;
      arStore.setInitialized(true);
      return;
    }

    await initializeAR();
  });

  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (mindarInstance) {
      try {
        mindarInstance.stop();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    // Dispose all loaded 3D model geometries and materials
    disposeLoadedModels();
    if (dracoLoaderRef) dracoLoaderRef.dispose();
    arStore.reset();
  });
</script>

<div class="relative w-full h-full bg-black overflow-hidden">
  <!-- AR Container (MindAR injects video + canvas here) -->
  <div bind:this={container} class="ar-container absolute inset-0 w-full h-full z-10 overflow-hidden"></div>

  <!-- Loading State -->
  {#if isLoading}
    <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-canopy-900/95 via-ocean-900/95 to-canopy-950/95 backdrop-blur-sm z-50">
      <div class="text-center text-white px-6">
        <div class="relative w-20 h-20 mx-auto mb-6">
          <div class="absolute inset-0 rounded-full border-4 border-canopy-400/30"></div>
          <div class="absolute inset-0 rounded-full border-4 border-t-canopy-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div class="absolute inset-2 rounded-full border-4 border-ocean-400/30"></div>
          <div class="absolute inset-2 rounded-full border-4 border-t-transparent border-r-ocean-400 border-b-transparent border-l-transparent animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <Icon icon="solar:camera-bold" class="w-8 h-8 text-white/80" />
          </div>
        </div>
        <p class="font-display text-xl font-semibold mb-2">{loadingMessage}</p>
        <p class="font-body text-sm text-white/60">Preparing your AR experience</p>
      </div>
    </div>
  {/if}

  <!-- Permission Denied -->
  {#if arStore.permissionDenied}
    <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-canopy-900 via-ocean-900 to-canopy-950 p-6 z-50">
      <div class="text-center text-white max-w-sm">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-coral-400/20 to-coral-600/20 flex items-center justify-center">
          <Icon icon="solar:camera-rotate-bold-duotone" class="w-12 h-12 text-coral-400" />
        </div>
        <h2 class="font-display text-2xl font-bold mb-3">Camera Access Needed</h2>
        <p class="font-body text-white/70 mb-6 leading-relaxed">
          ClimaTales AR needs camera access to scan your storybook pages and bring them to life!
        </p>
        <button
          onclick={() => location.reload()}
          class="bg-gradient-to-r from-canopy-500 to-ocean-500 text-white px-8 py-3 rounded-full font-accent font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Icon icon="solar:refresh-bold" class="w-5 h-5 inline mr-2" />
          Try Again
        </button>
      </div>
    </div>
  {/if}

  <!-- Error State -->
  {#if arStore.error && !demoMode}
    <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-coral-900/95 via-coral-800/95 to-coral-900/95 p-6 z-50">
      <div class="text-center text-white max-w-sm">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
          <Icon icon="solar:danger-triangle-bold-duotone" class="w-12 h-12 text-coral-300" />
        </div>
        <h2 class="font-display text-2xl font-bold mb-3">Something Went Wrong</h2>
        <p class="font-body text-white/70 mb-6 leading-relaxed">{arStore.error}</p>
        <button
          onclick={() => location.reload()}
          class="bg-white text-coral-600 px-8 py-3 rounded-full font-accent font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Try Again
        </button>
      </div>
    </div>
  {/if}

  <!-- Demo Mode UI -->
  {#if demoMode && !arStore.permissionDenied && !isLoading}
    <div class="absolute inset-0 flex flex-col bg-gradient-to-br from-canopy-900/95 via-ocean-900/95 to-canopy-950/95 z-40">
      <!-- Header -->
      <div class="p-4 pt-6 text-center">
        <div class="inline-flex items-center gap-2 bg-warning/20 text-warning px-4 py-2 rounded-full text-sm font-accent">
          <Icon icon="solar:info-circle-bold" class="w-4 h-4" />
          Demo Mode
        </div>
        <h2 class="font-display text-xl font-bold text-white mt-3">Select a Page to Preview</h2>
        <p class="font-body text-sm text-white/60 mt-1">AR tracking unavailable - tap a page to see content</p>
      </div>

      <!-- Page Grid -->
      <div class="flex-1 overflow-y-auto px-4 pb-24">
        <div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {#each pages as page, index}
            {#if page.id <= 11}
              <!-- Available Pages with thumbnails -->
              <button
                onclick={() => handleDemoPageSelect(index)}
                class="group relative bg-white/10 backdrop-blur-md rounded-[20px] p-3 text-left transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] border border-white/10 hover:border-canopy-400/40 shadow-lg hover:shadow-xl hover:shadow-canopy-500/20"
              >
                <!-- Page Number Badge -->
                <div class="absolute top-2 right-2 z-10 bg-gradient-to-br from-canopy-500 to-canopy-600 text-white text-xs font-accent font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                  {page.id}
                </div>

                <!-- Thumbnail Image -->
                <div class="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-canopy-800/50 to-ocean-800/50 ring-1 ring-white/10 group-hover:ring-canopy-400/30 transition-all">
                  <img
                    src="/pages/Page {page.id}.webp"
                    alt={page.title}
                    class="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                </div>

                <!-- Page Title -->
                <h3 class="font-accent font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-canopy-200 transition-colors">{page.title}</h3>
              </button>
            {:else}
              <!-- Coming Soon Pages (5+) -->
              <div
                class="relative bg-white/5 backdrop-blur-sm rounded-[20px] p-3 text-left border border-white/5 opacity-60"
              >
                <!-- Page Number Badge (muted) -->
                <div class="absolute top-2 right-2 z-10 bg-white/10 text-white/50 text-xs font-accent font-bold w-7 h-7 rounded-full flex items-center justify-center">
                  {page.id}
                </div>

                <!-- Placeholder -->
                <div class="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-white/5 to-white/10 ring-1 ring-white/5 flex flex-col items-center justify-center">
                  <Icon icon="solar:clock-circle-bold-duotone" class="w-10 h-10 text-white/30 mb-2" />
                  <span class="text-xs font-accent text-white/40">Coming Soon</span>
                </div>

                <!-- Page Title (muted) -->
                <h3 class="font-accent font-semibold text-white/40 text-sm leading-tight line-clamp-2">{page.title}</h3>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Scanning Overlay (when AR is active but no target detected) -->
  {#if !isLoading && !arStore.permissionDenied && !arStore.error && !demoMode && !arStore.hasDetectedPage}
    <div class="absolute inset-0 pointer-events-none z-30">
      <!-- Scanning frame -->
      <div class="absolute inset-8 border-2 border-white/30 rounded-3xl">
        <div class="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-canopy-400 rounded-tl-3xl"></div>
        <div class="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-canopy-400 rounded-tr-3xl"></div>
        <div class="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-canopy-400 rounded-bl-3xl"></div>
        <div class="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-canopy-400 rounded-br-3xl"></div>
      </div>

      <!-- Scanning animation -->
      <div class="absolute inset-8 overflow-hidden rounded-3xl">
        <div class="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-canopy-400 to-transparent animate-scan"></div>
      </div>

      <!-- Instructions -->
      <div class="absolute bottom-32 left-0 right-0 text-center px-6">
        <div class="inline-flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-6 py-3">
          <Icon icon="solar:book-bookmark-bold-duotone" class="w-6 h-6 text-canopy-400" />
          <span class="font-body text-white text-sm">Point camera at a storybook page</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Let MindAR manage its own video/canvas sizing.
     MindAR's resize() sets specific pixel values for top/left/width/height
     on the video element and renderer canvas to achieve a "cover" effect.
     The video sits at z-index:-2, the transparent WebGL canvas on top.
     Do NOT override these with !important — it breaks the camera feed display. */

  @keyframes scan {
    0% {
      top: 0%;
    }
    50% {
      top: 100%;
    }
    100% {
      top: 0%;
    }
  }

  .animate-scan {
    animation: scan 2s ease-in-out infinite;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
