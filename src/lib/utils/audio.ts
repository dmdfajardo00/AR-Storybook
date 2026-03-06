// Audio playback utilities for narration

let currentAudio: HTMLAudioElement | null = null;

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  src: string | null;
}

// Play an audio file
export function playAudio(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Stop any currently playing audio
    stopAudio();

    currentAudio = new Audio(src);

    currentAudio.addEventListener('ended', () => {
      currentAudio = null;
      resolve();
    });

    currentAudio.addEventListener('error', (e) => {
      currentAudio = null;
      reject(new Error(`Failed to play audio: ${e.message}`));
    });

    currentAudio.play().catch(reject);
  });
}

// Play multiple audio files in sequence
export async function playAudioSequence(srcs: string[]): Promise<void> {
  for (const src of srcs) {
    await playAudio(src);
  }
}

// Pause the currently playing audio
export function pauseAudio(): void {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
  }
}

// Resume paused audio
export function resumeAudio(): void {
  if (currentAudio && currentAudio.paused) {
    currentAudio.play();
  }
}

// Stop and reset the current audio
export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

// Toggle play/pause
export function toggleAudio(src?: string): boolean {
  if (currentAudio && !currentAudio.paused) {
    pauseAudio();
    return false;
  } else if (currentAudio && currentAudio.paused) {
    resumeAudio();
    return true;
  } else if (src) {
    playAudio(src);
    return true;
  }
  return false;
}

// Get the current audio state
export function getAudioState(): AudioState {
  return {
    isPlaying: currentAudio ? !currentAudio.paused : false,
    currentTime: currentAudio?.currentTime ?? 0,
    duration: currentAudio?.duration ?? 0,
    src: currentAudio?.src ?? null,
  };
}

// Check if audio is currently playing
export function isPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

// Set volume (0-1)
export function setVolume(volume: number): void {
  if (currentAudio) {
    currentAudio.volume = Math.max(0, Math.min(1, volume));
  }
}

// Preload audio for faster playback
export function preloadAudio(src: string): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = src;
  return audio;
}
