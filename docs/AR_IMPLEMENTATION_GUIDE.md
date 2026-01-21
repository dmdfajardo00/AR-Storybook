# MindAR + SvelteKit 5 - Technical Implementation Guide

This guide covers the specific implementation details for integrating MindAR.js with SvelteKit 5.

---

## 1. Installation

```bash
npm install mind-ar three
```

**Note**: MindAR bundles its own version of Three.js optimizations, but we install three separately for type support and additional utilities.

---

## 2. TypeScript Declarations

Create `src/lib/types/mindar.d.ts`:

```typescript
declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  import * as THREE from 'three';

  export interface MindARThreeOptions {
    container: HTMLElement;
    imageTargetSrc: string;
    maxTrack?: number;
    uiLoading?: string;
    uiScanning?: string;
    uiError?: string;
    filterMinCF?: number;
    filterBeta?: number;
    missTolerance?: number;
    warmupTolerance?: number;
  }

  export interface Anchor {
    group: THREE.Group;
    onTargetFound: () => void;
    onTargetLost: () => void;
  }

  export class MindARThree {
    constructor(options: MindARThreeOptions);
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    addAnchor(targetIndex: number): Anchor;
    start(): Promise<void>;
    stop(): void;
  }
}
```

---

## 3. MindAR Utility Module

Create `src/lib/utils/mindar.ts`:

```typescript
import { MindARThree, type Anchor } from 'mind-ar/dist/mindar-image-three.prod.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface ARInstance {
  mindar: MindARThree;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  anchors: Anchor[];
  stop: () => void;
}

export interface ARCallbacks {
  onTargetFound?: (targetIndex: number) => void;
  onTargetLost?: (targetIndex: number) => void;
  onError?: (error: Error) => void;
}

export async function initializeAR(
  container: HTMLElement,
  targetSrc: string,
  targetCount: number = 1,
  callbacks?: ARCallbacks
): Promise<ARInstance> {
  try {
    const mindar = new MindARThree({
      container,
      imageTargetSrc: targetSrc,
      maxTrack: targetCount,
      filterMinCF: 0.001,
      filterBeta: 100,
      missTolerance: 5,
      warmupTolerance: 5,
    });

    const { renderer, scene, camera } = mindar;
    const anchors: Anchor[] = [];

    // Create anchors for each target
    for (let i = 0; i < targetCount; i++) {
      const anchor = mindar.addAnchor(i);
      
      anchor.onTargetFound = () => {
        callbacks?.onTargetFound?.(i);
      };
      
      anchor.onTargetLost = () => {
        callbacks?.onTargetLost?.(i);
      };
      
      anchors.push(anchor);
    }

    // Start AR
    await mindar.start();

    // Animation loop
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    return {
      mindar,
      scene,
      camera,
      renderer,
      anchors,
      stop: () => {
        renderer.setAnimationLoop(null);
        mindar.stop();
      },
    };
  } catch (error) {
    callbacks?.onError?.(error as Error);
    throw error;
  }
}

// Load a 3D GLTF model
export async function loadModel(url: string): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  return gltf.scene;
}

// Create a simple plane with texture (for 2D overlays)
export function createImagePlane(
  imageUrl: string,
  width: number = 1,
  height: number = 1
): THREE.Mesh {
  const texture = new THREE.TextureLoader().load(imageUrl);
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geometry, material);
}

// Create a text sprite (for labels)
export function createTextSprite(
  text: string,
  fontSize: number = 64,
  textColor: string = '#ffffff',
  backgroundColor: string = 'rgba(0,0,0,0.5)'
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  
  canvas.width = 512;
  canvas.height = 128;
  
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  context.font = `${fontSize}px Arial`;
  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2, 0.5, 1);
  
  return sprite;
}
```

---

## 4. ARViewer Svelte Component

Create `src/lib/components/ar/ARViewer.svelte`:

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { initializeAR, loadModel, createImagePlane, type ARInstance } from '$lib/utils/mindar';
  import { arStore } from '$lib/stores/ar.svelte';
  import { pages } from '$lib/data/pages';
  
  // Props
  let { targetSrc = '/targets/storybook.mind' } = $props();
  
  // State
  let container: HTMLDivElement;
  let arInstance: ARInstance | null = $state(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let permissionDenied = $state(false);
  
  onMount(async () => {
    // Check camera permission first
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      permissionDenied = true;
      isLoading = false;
      return;
    }
    
    try {
      arInstance = await initializeAR(
        container,
        targetSrc,
        pages.length, // Number of pages to track
        {
          onTargetFound: (index) => {
            arStore.setDetectedPage(index);
            arStore.setOverlayVisible(true);
          },
          onTargetLost: (index) => {
            arStore.setOverlayVisible(false);
          },
          onError: (err) => {
            error = err.message;
          },
        }
      );
      
      // Add content to each anchor
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const anchor = arInstance.anchors[i];
        
        if (page.modelUrl) {
          // Load 3D model
          const model = await loadModel(page.modelUrl);
          model.scale.set(0.1, 0.1, 0.1);
          anchor.group.add(model);
        } else if (page.imageUrl) {
          // Use 2D image plane
          const plane = createImagePlane(page.imageUrl, 0.5, 0.5);
          plane.position.set(0, 0.3, 0);
          anchor.group.add(plane);
        }
      }
      
      isLoading = false;
    } catch (err) {
      error = (err as Error).message;
      isLoading = false;
    }
  });
  
  onDestroy(() => {
    arInstance?.stop();
  });
</script>

<div class="relative w-full h-full bg-black">
  <!-- AR Container -->
  <div bind:this={container} class="w-full h-full"></div>
  
  <!-- Loading State -->
  {#if isLoading}
    <div class="absolute inset-0 flex items-center justify-center bg-black/80">
      <div class="text-center text-white">
        <div class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="font-display text-lg">Starting Camera...</p>
        <p class="text-sm opacity-70 mt-2">Point at a storybook page</p>
      </div>
    </div>
  {/if}
  
  <!-- Permission Denied -->
  {#if permissionDenied}
    <div class="absolute inset-0 flex items-center justify-center bg-canopy-900 p-6">
      <div class="text-center text-white max-w-sm">
        <div class="text-6xl mb-4">📷</div>
        <h2 class="font-display text-2xl mb-2">Camera Access Needed</h2>
        <p class="text-sm opacity-80 mb-4">
          ClimaTales AR needs camera access to scan your storybook pages. 
          Please allow camera permissions and refresh the page.
        </p>
        <button
          onclick={() => location.reload()}
          class="bg-white text-canopy-600 px-6 py-3 rounded-button font-accent font-semibold"
        >
          Try Again
        </button>
      </div>
    </div>
  {/if}
  
  <!-- Error State -->
  {#if error}
    <div class="absolute inset-0 flex items-center justify-center bg-red-900/90 p-6">
      <div class="text-center text-white max-w-sm">
        <div class="text-6xl mb-4">⚠️</div>
        <h2 class="font-display text-2xl mb-2">Oops!</h2>
        <p class="text-sm opacity-80 mb-4">{error}</p>
        <button
          onclick={() => location.reload()}
          class="bg-white text-red-600 px-6 py-3 rounded-button font-accent font-semibold"
        >
          Try Again
        </button>
      </div>
    </div>
  {/if}
</div>
```

---

## 5. AR Overlay Component

Create `src/lib/components/ar/AROverlay.svelte`:

```svelte
<script lang="ts">
  import { arStore } from '$lib/stores/ar.svelte';
  import { pages } from '$lib/data/pages';
  import AudioButton from '$lib/components/shared/AudioButton.svelte';
  import { Button } from '$lib/components/ui/button';
  
  // Derived state
  let currentPage = $derived(
    arStore.detectedPageIndex !== null 
      ? pages[arStore.detectedPageIndex] 
      : null
  );
  
  function handleNext() {
    // Navigate to next page logic or go to quiz
  }
</script>

{#if arStore.overlayVisible && currentPage}
  <div 
    class="absolute bottom-24 left-4 right-4 animate-in slide-in-from-bottom duration-300"
  >
    <!-- Explanation Card -->
    <div class="bg-gradient-to-br from-green-100 to-green-200 rounded-card p-5 shadow-lg">
      <p class="text-canopy-900 leading-relaxed">
        {@html currentPage.explanation}
      </p>
      
      <div class="flex items-center gap-3 mt-4">
        <!-- Audio Button -->
        {#if currentPage.audioUrl}
          <AudioButton src={currentPage.audioUrl} />
        {/if}
        
        <!-- Next Button -->
        <Button onclick={handleNext} class="ml-auto">
          NEXT
          <span class="ml-1">→</span>
        </Button>
      </div>
    </div>
    
    <!-- Mascot -->
    <div class="absolute -bottom-2 -left-2 w-24 h-24">
      <img 
        src="/images/mascot/pointing.png" 
        alt="Terra" 
        class="w-full h-full object-contain"
      />
    </div>
  </div>
{/if}
```

---

## 6. AR Store (Svelte 5 Runes)

Create `src/lib/stores/ar.svelte.ts`:

```typescript
// AR State Store using Svelte 5 runes

let detectedPageIndex = $state<number | null>(null);
let overlayVisible = $state(false);
let isTracking = $state(false);

export const arStore = {
  get detectedPageIndex() { return detectedPageIndex; },
  get overlayVisible() { return overlayVisible; },
  get isTracking() { return isTracking; },
  
  setDetectedPage(index: number | null) {
    detectedPageIndex = index;
    isTracking = index !== null;
  },
  
  setOverlayVisible(visible: boolean) {
    overlayVisible = visible;
  },
  
  reset() {
    detectedPageIndex = null;
    overlayVisible = false;
    isTracking = false;
  },
};
```

---

## 7. Generating .mind Target Files

MindAR requires target images to be compiled into `.mind` files.

### Online Compiler (Recommended)
1. Go to: https://hiukim.github.io/mind-ar-js-doc/tools/compile/
2. Upload your storybook page images (one or multiple)
3. Download the generated `targets.mind` file
4. Place in `static/targets/storybook.mind`

### Tips for Good Tracking
- Use high-contrast images
- Avoid repetitive patterns
- More unique features = better tracking
- Test with the actual printed storybook

---

## 8. AR Mode Page

Create `src/routes/ar/+page.svelte`:

```svelte
<script lang="ts">
  import ARViewer from '$lib/components/ar/ARViewer.svelte';
  import AROverlay from '$lib/components/ar/AROverlay.svelte';
  import { arStore } from '$lib/stores/ar.svelte';
  import { onDestroy } from 'svelte';
  
  onDestroy(() => {
    arStore.reset();
  });
</script>

<svelte:head>
  <title>AR Mode - ClimaTales</title>
</svelte:head>

<div class="fixed inset-0">
  <ARViewer />
  <AROverlay />
</div>
```

---

## 9. Common Issues & Solutions

### Issue: "MindAR is not defined"
**Solution**: Make sure to import from the correct path:
```typescript
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
```

### Issue: Camera not starting on mobile
**Solution**: 
- Must be served over HTTPS (or localhost)
- Check camera permissions in browser settings
- iOS Safari requires user gesture to start

### Issue: Model not appearing
**Solution**:
- Check model file path
- Scale might be too large/small (try 0.1)
- Position might be outside view (try z: 0)

### Issue: Poor tracking
**Solution**:
- Use higher contrast target images
- Improve lighting conditions
- Adjust MindAR parameters:
  ```typescript
  filterMinCF: 0.001,  // Lower = more stable, slower
  filterBeta: 100,     // Higher = faster response
  missTolerance: 5,    // Frames before losing target
  ```

### Issue: Performance issues
**Solution**:
- Reduce 3D model polygon count
- Use compressed textures
- Lower camera resolution if needed
- Limit number of tracked targets

---

## 10. Testing Checklist

- [ ] AR initializes without errors
- [ ] Camera permission request appears
- [ ] Camera feed displays
- [ ] Target image is detected
- [ ] Overlay appears on detection
- [ ] Overlay hides when target lost
- [ ] 3D model/image renders correctly
- [ ] Audio plays when button pressed
- [ ] Works on Android Chrome
- [ ] Works on iOS Safari
- [ ] Works offline (after initial load)
