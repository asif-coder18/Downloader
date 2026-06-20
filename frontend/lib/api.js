/**
 * lib/api.js
 * -----------
 * All backend API calls — analyze + download.
 *
 * TWO-STEP DOWNLOAD FLOW:
 * ========================
 *   Step 1: POST /api/download/video  → backend runs yt-dlp, returns { token, filename }
 *   Step 2: GET  /api/file/{token}    → browser streams file natively (no RAM buffering)
 *
 * WHY NOT showSaveFilePicker?
 * ============================
 * Chrome's File System Access API requires the call to happen synchronously
 * within the original user gesture. Because Step 1 is a long async fetch
 * (yt-dlp can take 60+ seconds), Chrome revokes the gesture token before
 * Step 2 runs — causing showSaveFilePicker to throw NotAllowedError on every
 * download after the first. The anchor-tag approach below is fully reliable.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Analyze ──────────────────────────────────────────────────────────────────

/**
 * Fetch media metadata from a social media URL.
 * @param {string} url
 * @returns {Promise<object>} MediaInfo
 */
export async function analyzeUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || `Server error ${res.status}`);
    }

    return res.json();
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Request timed out. Please try again.");
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Download (two-step) ──────────────────────────────────────────────────────

/**
 * Download a video.
 * @param {string}   url        Social media URL
 * @param {string}   quality    "best" | "1080p" | "720p" | "360p"
 * @param {function} onProgress Called with 0→100 progress values
 */
export async function downloadVideo(url, quality = "best", onProgress) {
  return _download("/api/download/video", {
    url,
    quality: quality.toLowerCase(),
    format: "video",
  }, onProgress);
}

/**
 * Download audio as MP3.
 * @param {string}   url
 * @param {function} onProgress
 */
export async function downloadAudio(url, onProgress) {
  return _download("/api/download/audio", {
    url,
    quality: "best",
    format: "mp3",
  }, onProgress);
}

/**
 * Core two-step download function.
 *
 * Each call is fully self-contained with its own AbortController and timeout.
 * No shared mutable state between calls — safe for unlimited sequential downloads.
 */
async function _download(endpoint, body, onProgress) {
  if (typeof window === "undefined") {
    throw new Error("Downloads can only be triggered in the browser.");
  }

  onProgress?.(5);

  // ── Step 1: Ask backend to prepare the file ───────────────────────────────
  // Create a fresh AbortController for every download call.
  // Never reuse one — an aborted controller cannot be reset.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 min

  let token, filename;

  try {
    onProgress?.(10);

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    onProgress?.(80);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || `Download failed (${res.status})`);
    }

    const contentType = res.headers.get("Content-Type") || "";

    if (contentType.includes("application/json")) {
      // Normal two-step flow: backend returned a download token
      const data = await res.json();
      token    = data.token;
      filename = data.filename;
    } else {
      // Legacy flow: backend returned the file directly
      onProgress?.(90);
      await _blobDownload(res);
      onProgress?.(100);
      return;
    }

  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Download timed out. The file may be too large or the server is slow.");
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }

  onProgress?.(90);

  // ── Step 2: Trigger browser file download ─────────────────────────────────
  // We use a hidden anchor tag. This is the most reliable cross-browser method:
  //   ✅ Works on Chrome, Firefox, Safari, Edge
  //   ✅ Works on mobile
  //   ✅ Doesn't navigate away from the page
  //   ✅ No popup blocker issues
  //   ✅ Works on the 2nd, 3rd, Nth download without page refresh
  //   ✅ Browser shows native download progress in its own UI
  _triggerAnchorDownload(`${API_BASE}/api/file/${token}`, filename);

  onProgress?.(100);
}

/**
 * Trigger a browser file download via a hidden anchor tag.
 * The server responds with Content-Disposition: attachment, so the browser
 * saves the file instead of displaying it.
 *
 * Each call creates and removes its own anchor — no leftover DOM nodes.
 */
function _triggerAnchorDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  a.style.display = "none";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();

  // Clean up the anchor after a short delay
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
  }, 1000);
}

/**
 * Fallback for when the backend returns the file directly (legacy flow).
 * Buffers the file in RAM — only suitable for small files.
 */
async function _blobDownload(response) {
  if (typeof window === "undefined") return;

  const disposition = response.headers.get("Content-Disposition") || "";
  let filename = "download";

  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
  if (match) {
    filename = decodeURIComponent(match[1].trim());
  }

  if (!filename.includes(".")) {
    const ct = response.headers.get("Content-Type") || "";
    filename += ct.includes("audio") ? ".mp3" : ".mp4";
  }

  const blob = await response.blob();
  if (blob.size === 0) throw new Error("Received empty file from server.");

  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
    if (document.body.contains(a)) document.body.removeChild(a);
  }, 2000);
}

// ─── Health check ─────────────────────────────────────────────────────────────

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "healthy";
  } catch {
    return false;
  }
}
