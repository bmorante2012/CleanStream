import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a URL-friendly slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50)
}

// Extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

// Format milliseconds to readable time
export function formatMs(ms: number): string {
  const absMs = Math.abs(ms)
  const sign = ms < 0 ? '-' : '+'
  const seconds = Math.floor(absMs / 1000)
  const remaining = absMs % 1000

  if (seconds === 0) {
    return `${sign}${remaining}ms`
  }

  return `${sign}${seconds}.${String(remaining).padStart(3, '0')}s`
}

// Generate viewer fingerprint (simple, non-tracking)
export function generateViewerFingerprint(): string {
  if (typeof window === 'undefined') return ''

  let fingerprint = localStorage.getItem('cleanstream_viewer_id')
  if (!fingerprint) {
    fingerprint = 'v_' + Math.random().toString(36).slice(2, 11)
    localStorage.setItem('cleanstream_viewer_id', fingerprint)
  }
  return fingerprint
}
