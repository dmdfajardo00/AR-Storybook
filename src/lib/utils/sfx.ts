/**
 * Procedural sound effects system using Web Audio API.
 * All sounds are generated programmatically — no audio files needed.
 * Designed for a kids' educational app: cheerful, subtle, and pleasant.
 */

const STORAGE_KEY = 'climatales_sfx_muted';

let ctx: AudioContext | null = null;
let muted = false;

// Restore mute preference
try {
  muted = localStorage.getItem(STORAGE_KEY) === 'true';
} catch {
  // localStorage unavailable
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  } catch {
    return null;
  }
}

function shouldPlay(): boolean {
  return !muted && !prefersReducedMotion();
}

// ---------------------------------------------------------------------------
// Helper: play a single tone
// ---------------------------------------------------------------------------
function playTone(
  frequency: number,
  duration: number,
  options: {
    type?: OscillatorType;
    gain?: number;
    freqEnd?: number;
    attackTime?: number;
    decayStart?: number;
  } = {}
): void {
  const ac = getCtx();
  if (!ac) return;

  const {
    type = 'sine',
    gain: vol = 0.2,
    freqEnd,
    attackTime = 0.005,
    decayStart,
  } = options;

  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gainNode = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
  }

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(vol, now + attackTime);

  const decayPoint = decayStart ?? duration * 0.3;
  gainNode.gain.setValueAtTime(vol, now + decayPoint);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gainNode).connect(ac.destination);
  osc.start(now);
  osc.stop(now + duration);
}

// ---------------------------------------------------------------------------
// Helper: play an arpeggio (sequence of tones)
// ---------------------------------------------------------------------------
function playArpeggio(
  frequencies: number[],
  noteDuration: number,
  options: {
    type?: OscillatorType;
    gain?: number;
    overlap?: number;
  } = {}
): void {
  const ac = getCtx();
  if (!ac) return;

  const { type = 'triangle', gain: vol = 0.2, overlap = 0 } = options;
  const now = ac.currentTime;
  const step = noteDuration - overlap;

  frequencies.forEach((freq, i) => {
    const start = now + i * step;
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(vol, start + 0.005);
    gainNode.gain.setValueAtTime(vol, start + noteDuration * 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + noteDuration);

    osc.connect(gainNode).connect(ac.destination);
    osc.start(start);
    osc.stop(start + noteDuration);
  });
}

// ---------------------------------------------------------------------------
// Helper: play a burst of filtered noise
// ---------------------------------------------------------------------------
function playNoise(
  duration: number,
  options: {
    gain?: number;
    filterType?: BiquadFilterType;
    filterFreq?: number;
    filterFreqEnd?: number;
    filterQ?: number;
  } = {}
): void {
  const ac = getCtx();
  if (!ac) return;

  const {
    gain: vol = 0.15,
    filterType = 'bandpass',
    filterFreq = 1000,
    filterFreqEnd,
    filterQ = 1,
  } = options;

  const now = ac.currentTime;
  const bufferSize = Math.ceil(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ac.createBufferSource();
  source.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(filterFreq, now);
  if (filterFreqEnd !== undefined) {
    filter.frequency.exponentialRampToValueAtTime(filterFreqEnd, now + duration);
  }
  filter.Q.setValueAtTime(filterQ, now);

  const gainNode = ac.createGain();
  gainNode.gain.setValueAtTime(vol, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  source.connect(filter).connect(gainNode).connect(ac.destination);
  source.start(now);
  source.stop(now + duration);
}

// ---------------------------------------------------------------------------
// Sound effects
// ---------------------------------------------------------------------------

/** Very short soft click for button presses. */
function tap(): void {
  try {
    if (!shouldPlay()) return;
    playTone(800, 0.05, { type: 'sine', gain: 0.15, decayStart: 0.005 });
  } catch { /* never crash */ }
}

/** Soft pop for quiz option selection. */
function select(): void {
  try {
    if (!shouldPlay()) return;
    playTone(600, 0.08, { type: 'sine', gain: 0.2, freqEnd: 900, decayStart: 0.02 });
  } catch { /* never crash */ }
}

/** Cheerful 3-note ascending chime: C5-E5-G5. */
function correct(): void {
  try {
    if (!shouldPlay()) return;
    playArpeggio([523.25, 659.25, 783.99], 0.12, { type: 'triangle', gain: 0.25 });
  } catch { /* never crash */ }
}

/** Gentle 2-note descending tone: G4-E4. Not harsh. */
function incorrect(): void {
  try {
    if (!shouldPlay()) return;
    playArpeggio([392.0, 329.63], 0.15, { type: 'sine', gain: 0.18 });
  } catch { /* never crash */ }
}

/** Sparkly rapid ascending scale with shimmer. ~400ms total. */
function celebrate(): void {
  try {
    if (!shouldPlay()) return;
    const ac = getCtx();
    if (!ac) return;

    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const now = ac.currentTime;
    const noteGap = 0.055;
    const noteDur = 0.12;

    notes.forEach((freq, i) => {
      const start = now + i * noteGap;

      // Fundamental
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.2, start + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, start + noteDur);
      osc.connect(g).connect(ac.destination);
      osc.start(start);
      osc.stop(start + noteDur);

      // Shimmer harmonic (octave up, quieter)
      const osc2 = ac.createOscillator();
      const g2 = ac.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, start);
      g2.gain.setValueAtTime(0, start);
      g2.gain.linearRampToValueAtTime(0.08, start + 0.005);
      g2.gain.exponentialRampToValueAtTime(0.001, start + noteDur);
      osc2.connect(g2).connect(ac.destination);
      osc2.start(start);
      osc2.stop(start + noteDur);
    });
  } catch { /* never crash */ }
}

/** Soft whoosh for navigation. Filtered white noise with bandpass sweep. */
function nav(): void {
  try {
    if (!shouldPlay()) return;
    playNoise(0.1, {
      gain: 0.12,
      filterType: 'bandpass',
      filterFreq: 800,
      filterFreqEnd: 2500,
      filterQ: 0.8,
    });
  } catch { /* never crash */ }
}

/** Paper swish. Short burst of high-pass filtered noise. */
function pageTurn(): void {
  try {
    if (!shouldPlay()) return;
    playNoise(0.08, {
      gain: 0.12,
      filterType: 'highpass',
      filterFreq: 3000,
      filterFreqEnd: 6000,
      filterQ: 0.5,
    });
  } catch { /* never crash */ }
}

/** Magical shimmer for AR detection. Harmonics with slow attack. */
function arDetect(): void {
  try {
    if (!shouldPlay()) return;
    const ac = getCtx();
    if (!ac) return;

    const now = ac.currentTime;
    const duration = 0.3;
    const harmonics = [880, 1318.5, 1760]; // A5, E6, A6

    harmonics.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Slight detune for ethereal feel
      osc.detune.setValueAtTime(i * 5, now);

      const vol = 0.15 - i * 0.03;
      g.gain.setValueAtTime(0, now);
      // Slow attack for ethereal feel
      g.gain.linearRampToValueAtTime(vol, now + duration * 0.4);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(g).connect(ac.destination);
      osc.start(now);
      osc.stop(now + duration);
    });
  } catch { /* never crash */ }
}

/** Subtle rising tone for modal open. */
function modalOpen(): void {
  try {
    if (!shouldPlay()) return;
    playTone(400, 0.15, { type: 'sine', gain: 0.12, freqEnd: 600, decayStart: 0.05 });
  } catch { /* never crash */ }
}

/** Subtle falling tone for modal close. */
function modalClose(): void {
  try {
    if (!shouldPlay()) return;
    playTone(600, 0.15, { type: 'sine', gain: 0.12, freqEnd: 400, decayStart: 0.05 });
  } catch { /* never crash */ }
}

/** Bright completion ping. Single C6 with reverb-like decay. */
function complete(): void {
  try {
    if (!shouldPlay()) return;
    const ac = getCtx();
    if (!ac) return;

    const now = ac.currentTime;
    const freq = 1046.5; // C6

    // Main ping
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.25, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(g).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    // Reverb-like tail (octave up, quieter, longer decay)
    const osc2 = ac.createOscillator();
    const g2 = ac.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);
    g2.gain.setValueAtTime(0, now);
    g2.gain.linearRampToValueAtTime(0.06, now + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(g2).connect(ac.destination);
    osc2.start(now);
    osc2.stop(now + 0.35);
  } catch { /* never crash */ }
}

// ---------------------------------------------------------------------------
// Mute controls
// ---------------------------------------------------------------------------

function mute(): void {
  muted = true;
  try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
}

function unmute(): void {
  muted = false;
  try { localStorage.setItem(STORAGE_KEY, 'false'); } catch { /* ignore */ }
}

function toggleMute(): boolean {
  if (muted) unmute(); else mute();
  return muted;
}

function isMuted(): boolean {
  return muted;
}

// ---------------------------------------------------------------------------
// Exported sfx object
// ---------------------------------------------------------------------------

export const sfx = {
  tap,
  select,
  correct,
  incorrect,
  celebrate,
  nav,
  pageTurn,
  arDetect,
  modalOpen,
  modalClose,
  complete,
  mute,
  unmute,
  toggleMute,
  isMuted,
} as const;

export type Sfx = typeof sfx;
