import type { ARState } from '$lib/types';

function createARStore() {
  let state = $state<ARState>({
    isInitialized: false,
    isTracking: false,
    detectedPageIndex: null,
    overlayVisible: false,
    error: null,
    permissionDenied: false,
  });

  // Derived state
  const hasDetectedPage = $derived(state.detectedPageIndex !== null);
  const shouldShowOverlay = $derived(state.overlayVisible && hasDetectedPage);

  // Set initialized
  function setInitialized(value: boolean) {
    state.isInitialized = value;
  }

  // Set detected page
  function setDetectedPage(index: number | null) {
    state.detectedPageIndex = index;
    state.isTracking = index !== null;
  }

  // Set overlay visibility
  function setOverlayVisible(visible: boolean) {
    state.overlayVisible = visible;
  }

  // Set error
  function setError(error: string | null) {
    state.error = error;
  }

  // Set permission denied
  function setPermissionDenied(denied: boolean) {
    state.permissionDenied = denied;
  }

  // Target found callback
  function onTargetFound(index: number) {
    setDetectedPage(index);
    setOverlayVisible(true);
  }

  // Target lost callback
  function onTargetLost() {
    setOverlayVisible(false);
  }

  // Reset state
  function reset() {
    state = {
      isInitialized: false,
      isTracking: false,
      detectedPageIndex: null,
      overlayVisible: false,
      error: null,
      permissionDenied: false,
    };
  }

  return {
    get state() {
      return state;
    },
    get isInitialized() {
      return state.isInitialized;
    },
    get isTracking() {
      return state.isTracking;
    },
    get detectedPageIndex() {
      return state.detectedPageIndex;
    },
    get overlayVisible() {
      return state.overlayVisible;
    },
    get error() {
      return state.error;
    },
    get permissionDenied() {
      return state.permissionDenied;
    },
    get hasDetectedPage() {
      return hasDetectedPage;
    },
    get shouldShowOverlay() {
      return shouldShowOverlay;
    },
    setInitialized,
    setDetectedPage,
    setOverlayVisible,
    setError,
    setPermissionDenied,
    onTargetFound,
    onTargetLost,
    reset,
  };
}

export const arStore = createARStore();
