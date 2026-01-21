import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Format a date to a friendly string
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format time elapsed (e.g., "2 min ago")
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(dateString);
}

// Calculate quiz score percentage
export function calculateScorePercentage(score: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

// Get score message based on percentage
export function getScoreMessage(percentage: number): { message: string; emoji: string } {
  if (percentage === 100) return { message: 'Perfect Score!', emoji: '🌟' };
  if (percentage >= 80) return { message: 'Excellent!', emoji: '🎉' };
  if (percentage >= 60) return { message: 'Good Job!', emoji: '👍' };
  if (percentage >= 40) return { message: 'Keep Learning!', emoji: '📚' };
  return { message: 'Try Again!', emoji: '💪' };
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Check if device is mobile
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Check if device supports camera
export async function hasCamera(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) return false;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === 'videoinput');
  } catch {
    return false;
  }
}

// Open YouTube URL
export function openYouTube(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Extract YouTube video ID from URL
export function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Get YouTube thumbnail URL
export function getYouTubeThumbnail(url: string, quality: 'default' | 'medium' | 'high' | 'max' = 'medium'): string | null {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    max: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Pluralize a word
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
