/**
 * lib/utils.js
 * ------------
 * Shared utility functions used across the app.
 */

// Maximum file size the backend accepts for uploads (matches .env MAX_FILE_SIZE_MB).
// Keep in sync with backend/app/config/settings.py default.
export const MAX_UPLOAD_SIZE_MB = 2048;

/** True if a File/Blob is too big for upload. */
export function isFileTooLarge(file) {
  return file && file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024;
}

/** Formats a byte count into a readable size like "1.4 GB". */
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Formats an ISO date string into a human-readable relative time.
 * e.g. "2 hours ago", "3 days ago"
 */
export function timeAgo(isoString) {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * Generates a unique ID string (for new history entries, toasts, etc.)
 */
export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Truncates a string to maxLen characters, appending "…" if needed.
 */
export function truncate(str, maxLen = 60) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

/**
 * Validates whether a string looks like a URL.
 */
export function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Simulates a download progress animation.
 * Calls onProgress(percent) repeatedly, then onComplete() when done.
 */
export function simulateDownload(onProgress, onComplete) {
  let progress = 0;
  const interval = setInterval(() => {
    // Accelerate near the end for a realistic feel
    const increment = progress < 70 ? Math.random() * 8 + 2 : Math.random() * 15 + 5;
    progress = Math.min(progress + increment, 100);
    onProgress(Math.floor(progress));

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(onComplete, 300);
    }
  }, 200);

  return () => clearInterval(interval); // cleanup function
}

/**
 * Copies text to clipboard and returns a promise.
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}

/**
 * Returns a CSS class string for a platform badge background.
 */
export function getPlatformGradient(platform) {
  const gradients = {
    Facebook:  "from-blue-500 to-blue-700",
    Instagram: "from-pink-500 via-purple-500 to-orange-400",
    TikTok:    "from-gray-800 to-gray-950",
  };
  return gradients[platform] || "from-violet-500 to-purple-700";
}
