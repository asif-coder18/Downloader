/**
 * lib/mockData.js
 * ---------------
 * Central mock data store for the Universal Social Media Downloader.
 * Since this is a frontend-only app, all "API responses" come from here.
 * In a real app, you'd replace these with actual API calls.
 */

// ─── Platform Detection ───────────────────────────────────────────────────────

/**
 * Maps URL patterns to platform names.
 * Used by detectPlatform() to identify which service a URL belongs to.
 */
export const PLATFORM_PATTERNS = [
  { name: "YouTube",   color: "#FF0000", pattern: /youtube\.com|youtu\.be/i },
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
  { label: "360p",  value: "360p",  badge: "" },
];

// ─── Mock Media Results ───────────────────────────────────────────────────────

/**
 * Fake media metadata returned after "fetching" a URL.
 * Each entry simulates what a real downloader API would return.
 */
export const MOCK_MEDIA_RESULTS = [
  {
    id: "yt-001",
    platform: "YouTube",
    platformColor: "#FF0000",
    title: "Next.js 15 Full Course – Build Modern Web Apps",
    channel: "Fireship",
    duration: "1:24:37",
    views: "2.4M",
    thumbnail: "https://picsum.photos/seed/yt001/640/360",
    formats: ["video", "audio", "mp3"],
    qualities: ["best", "1080p", "720p", "360p"],
    fileSize: { best: "1.2 GB", "1080p": "980 MB", "720p": "540 MB", "360p": "180 MB" },
  },
  {
    id: "ig-001",
    platform: "Instagram",
    platformColor: "#E1306C",
    title: "Aesthetic Morning Routine 🌅 #lifestyle #morning",
    channel: "@aesthetic.life",
    duration: "0:58",
    views: "1.1M",
    thumbnail: "https://picsum.photos/seed/ig001/640/360",
    formats: ["video", "reel", "audio"],
    qualities: ["best", "1080p", "720p"],
    fileSize: { best: "48 MB", "1080p": "38 MB", "720p": "22 MB" },
  },
  {
    id: "tt-001",
    platform: "TikTok",
    platformColor: "#010101",
    title: "POV: You discovered this coding trick 🤯 #coding #dev",
    channel: "@devtricks",
    duration: "0:30",
    views: "8.7M",
    thumbnail: "https://picsum.photos/seed/tt001/640/360",
    formats: ["video", "reel", "mp3"],
    qualities: ["best", "720p", "360p"],
    fileSize: { best: "18 MB", "720p": "12 MB", "360p": "6 MB" },
  },
  {
    id: "fb-001",
    platform: "Facebook",
    platformColor: "#1877F2",
    title: "Epic Travel Compilation – Southeast Asia 2024",
    channel: "Travel Vibes",
    duration: "5:42",
    views: "3.3M",
    thumbnail: "https://picsum.photos/seed/fb001/640/360",
    formats: ["video", "audio", "mp3"],
    qualities: ["best", "1080p", "720p", "360p"],
    fileSize: { best: "320 MB", "1080p": "260 MB", "720p": "140 MB", "360p": "55 MB" },
  },
];

/**
 * Returns a random mock result, or picks one based on detected platform.
 * Simulates a real API fetch with a delay.
 */
export async function fetchMockMediaInfo(url) {
  // Simulate network delay (800ms – 2s)
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

  const platform = detectPlatform(url);

  if (platform) {
    const match = MOCK_MEDIA_RESULTS.find(
      (m) => m.platform.toLowerCase() === platform.name.toLowerCase()
    );
    if (match) return match;
  }

  // Return a random result if no specific match
  return MOCK_MEDIA_RESULTS[Math.floor(Math.random() * MOCK_MEDIA_RESULTS.length)];
}

// ─── Mock Download History ────────────────────────────────────────────────────

export const INITIAL_HISTORY = [
  {
    id: "h-001",
    platform: "YouTube",
    platformColor: "#FF0000",
    title: "React 19 – Everything You Need to Know",
    thumbnail: "https://picsum.photos/seed/h001/320/180",
    format: "Video",
    quality: "1080p",
    fileSize: "980 MB",
    downloadedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    duration: "45:12",
  },
  {
    id: "h-002",
    platform: "TikTok",
    platformColor: "#010101",
    title: "Satisfying Coding Setup Tour 🖥️",
    thumbnail: "https://picsum.photos/seed/h002/320/180",
    format: "Reel",
    quality: "720p",
    fileSize: "12 MB",
    downloadedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5h ago
    duration: "0:45",
  },
  {
    id: "h-003",
    platform: "Instagram",
    platformColor: "#E1306C",
    title: "Golden Hour Photography Tips 📸",
    thumbnail: "https://picsum.photos/seed/h003/320/180",
    format: "Reel",
    quality: "Best",
    fileSize: "48 MB",
    downloadedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h ago
    duration: "1:02",
  },

  {
    id: "h-005",
    platform: "YouTube",
    platformColor: "#FF0000",
    title: "Lo-fi Hip Hop Radio – Beats to Study/Relax",
    thumbnail: "https://picsum.photos/seed/h005/320/180",
    format: "MP3",
    quality: "Best",
    fileSize: "8.4 MB",
    downloadedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12h ago
    duration: "3:28",
  },
  {
    id: "h-006",
    platform: "Facebook",
    platformColor: "#1877F2",
    title: "Street Food Tour – Bangkok Night Market",
    thumbnail: "https://picsum.photos/seed/h006/320/180",
    format: "Video",
    quality: "1080p",
    fileSize: "260 MB",
    downloadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    duration: "8:15",
  },
];

// ─── Supported Platforms (for UI display) ────────────────────────────────────

export const SUPPORTED_PLATFORMS = [
  { name: "YouTube",   color: "#FF0000", bgClass: "bg-red-500",    description: "Videos, Shorts, Playlists" },
  { name: "Facebook",  color: "#1877F2", bgClass: "bg-blue-600",   description: "Videos, Reels, Stories" },
  { name: "Instagram", color: "#E1306C", bgClass: "bg-pink-600",   description: "Reels, Posts, Stories" },
  { name: "TikTok",    color: "#010101", bgClass: "bg-gray-900",   description: "Videos, Sounds" },
];

// ─── FAQ / Stats (for About page) ────────────────────────────────────────────

export const STATS = [
  { label: "Downloads",    value: "50M+",  icon: "Download" },
  { label: "Platforms",    value: "4+",    icon: "Globe" },
  { label: "Happy Users",  value: "2M+",   icon: "Users" },
  { label: "Uptime",       value: "99.9%", icon: "Zap" },
];

export const FAQS = [
  {
    q: "Is this service free to use?",
    a: "Yes! Our Universal Social Media Downloader is completely free. No sign-up required.",
  },
  {
    q: "What video qualities are supported?",
    a: "We support 360p, 720p, 1080p, and the best available quality for each platform.",
  },
  {
    q: "Can I download audio only?",
    a: "Absolutely. Use the Audio or MP3 download buttons to extract just the audio track.",
  },
  {
    q: "Is it legal to download social media content?",
    a: "Downloading content for personal use is generally acceptable. Always respect copyright and the platform's terms of service.",
  },
  {
    q: "How many videos can I download per day?",
    a: "There are no hard limits on our end. Download as much as you need.",
  },
];
