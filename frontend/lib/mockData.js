/**
 * lib/mockData.js
 * ---------------
 * Central mock data store / platform detection helpers.
 */

// ─── Platform Detection ───────────────────────────────────────────────────────

export const PLATFORM_PATTERNS = [
  { name: "Facebook",  color: "#1877F2", pattern: /facebook\.com|fb\.watch/i },
  { name: "Instagram", color: "#E1306C", pattern: /instagram\.com/i },
  { name: "TikTok",    color: "#010101", pattern: /tiktok\.com/i },
];

/**
 * Detects the platform from a given URL string.
 * Returns the matching platform object or null if unknown.
 */
export function detectPlatform(url) {
  if (!url) return null;
  return PLATFORM_PATTERNS.find((p) => p.pattern.test(url)) || null;
}

// ─── Quality Options ──────────────────────────────────────────────────────────

export const QUALITY_OPTIONS = [
  { label: "Best",  value: "best",  badge: "⭐" },
  { label: "1080p", value: "1080p", badge: "HD" },
  { label: "720p",  value: "720p",  badge: "" },
];