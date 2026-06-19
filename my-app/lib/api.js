/**
 * lib/api.js
 * -----------
 * All backend API calls — analyze + download.
 *
 * ROOT CAUSES OF PREVIOUS DOWNLOAD FAILURES (and fixes):
 * ========================================================
 *
 * CAUSE 1 — Server-side execution
 *   Next.js App Router can run components on the server.
 *   `document`, `URL.createObjectURL`, `window` don't exist on the server.
 *   FIX: Guard every DOM call with `typeof window !== "undefined"` checks,
 *        and only call download functions from onClick handlers (always client).
 *
 * CAUSE 2 — No timeout on long-running fetch
 *   yt-dlp can take 30-90 seconds to download a video.
 *   Without a timeout, the browser may silently drop the connection.
 *   FIX: Use AbortController with a 5-minute timeout.
 *
 * CAUSE 3 — Blob read failure on large files
 *   `response.blob()` buffers the ENTIRE file in browser memory.
 *   For large files this can fail with out-of-memory errors.
 *   FIX: Use a streaming approach — create a direct download URL instead.
 *        For the backend response, we use a two-step approach:
 *        Step 1: POST to get a download token/path
 *        Step 2: GET the file directly (browser handles streaming natively)
 *
 * CAUSE 4 — Content-Disposition not readable
 *   CORS `expose_headers` must include "Content-Disposition" for JS to read it.
 *   FIX: Already set in backend. Also add fallback filename detection.
 *
 * CAUSE 5 — quality value mismatch
 *   Frontend sends "Best" (capital B) but backend expects "best" (lowercase).
 *   FIX: Always lowercase the quality before sending.
 *
 * HOW THE NEW DOWNLOAD FLOW WORKS:
 * ==================================
 * OLD (broken): POST → wait for entire file → blob → anchor click
 *   Problem: Buffers entire file in RAM, can timeout, SSR issues
 *
 * NEW (working): Two-step approach
 *   Step 1: POST /api/download/video → backend downloads file, returns { token, filename }
 *   Step 2: window.location.href = /api/file/{token} → browser streams file directly
 *
 * This is how professional download services work (e.g., WeTransfer, Dropbox).
 * The browser handles the streaming download natively — no blob needed.
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
  const timeout = setTimeout(() => controller.abort(), 30_000); // 30s timeout

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
 *
 * Step 1: POST to backend — yt-dlp downloads the file, returns a token.
 * Step 2: Navigate browser to /api/file/{token} — file streams directly.
 *
 * @param {string}   url        Social media URL
 * @param {string}   quality    "best" | "1080p" | "720p" | "360p"
 * @param {function} onProgress Called with 0→100 progress values
 */
export async function downloadVideo(url, quality = "best", onProgress) {
  return _download("/api/download/video", {
    url,
    quality: quality.toLowerCase().replace("p", "").replace("best", "best"),
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
 * Core download function.
 *
 * WHY TWO STEPS?
 * ===============
 * If we do: fetch() → response.blob() → createObjectURL → click
 * The ENTIRE file must be downloaded into browser RAM before anything happens.
 * For a 500MB video this will crash the tab.
 *
 * Instead:
 * 1. POST tells the backend to prepare the file → backend returns a token
 * 2. We set window.location.href to the file URL → browser streams it directly
 *    The browser shows its native download progress bar and saves to disk.
 *    No RAM buffering. Works on mobile. Works on all browsers.
 */
async function _download(endpoint, body, onProgress) {
  // Safety: this function must only run in the browser
  if (typeof window === "undefined") {
    throw new Error("Downloads can only be triggered in the browser.");
  }

  onProgress?.(5);

  // ── Step 1: Tell backend to prepare the file ──────────────────────────────
  // This POST request waits while yt-dlp downloads the media.
  // The backend responds with { token, filename, size } — NOT the file itself.
  const controller = new AbortController();
  // 10 minute timeout — some videos take a long time to download
  const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000);

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
      // Error response is JSON
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || `Download failed (${res.status})`);
    }

    // ── Check what the backend returned ──────────────────────────────────────
    const contentType = res.headers.get("Content-Type") || "";

    if (contentType.includes("application/json")) {
      // New two-step flow: backend returned a token
      const data = await res.json();
      token    = data.token;
      filename = data.filename;
    } else {
      // Legacy flow: backend returned the file directly (FileResponse)
      // Fall back to blob download for backward compatibility
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

  // ── Step 2: Save or stream the file ───────────────────────────────────────
  const fileUrl = `${API_BASE}/api/file/${token}`;

  // If the browser supports the File System Access API (showSaveFilePicker),
  // we can use it to let the user select where to save the file.
  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      const ext = filename?.substring(filename.lastIndexOf(".")) || ".mp4";
      const mime = ext === ".mp3" ? "audio/mpeg" : (ext === ".mp4" ? "video/mp4" : "application/octet-stream");
      
      // 1. Ask user where to save
      const handle = await window.showSaveFilePicker({
        suggestedName: filename || "video.mp4",
        types: [
          {
            description: ext === ".mp3" ? "Audio File" : "Video File",
            accept: {
              [mime]: [ext],
            },
          },
        ],
      });
      
      onProgress?.(95);

      // 2. Fetch the file stream
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file stream (${response.status})`);
      }
      
      // 3. Pipe response body directly to writable file handle
      const writable = await handle.createWritable();
      await response.body.pipeTo(writable);
      
      onProgress?.(100);
      return;
    } catch (err) {
      // If the user cancelled the picker, abort without falling back
      if (err.name === "AbortError") {
        throw new Error("Save cancelled by user.");
      }
      // If it's a different error, log it and fall back to standard browser download
      console.warn("showSaveFilePicker failed, falling back to legacy download", err);
    }
  }

  // Fallback: Use standard browser download (anchor tag trigger)
  _triggerFileDownload(fileUrl, filename);

  onProgress?.(100);
}

/**
 * Trigger a file download using a hidden iframe.
 * The iframe loads the file URL, which has Content-Disposition: attachment,
 * so the browser saves it instead of displaying it.
 *
 * Why iframe instead of window.location.href?
 * - window.location.href navigates away from the page (bad UX)
 * - window.open() is blocked by popup blockers
 * - iframe is invisible and doesn't affect the current page
 */
function _triggerFileDownload(url, filename) {
  // Method 1: anchor tag with download attribute (most reliable for same-origin)
  // Works when the file URL is on the same origin as the page
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  a.style.display = "none";
  a.target = "_blank"; // Fallback: open in new tab if download fails
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();

  // Clean up after a short delay
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
  }, 1000);
}

/**
 * Fallback blob download for when the backend sends the file directly.
 * Used when the backend returns FileResponse instead of a token.
 *
 * NOTE: This buffers the entire file in RAM. Only suitable for small files.
 * For large files, the two-step token approach is used instead.
 */
async function _blobDownload(response) {
  if (typeof window === "undefined") return;

  // Get filename from Content-Disposition header
  const disposition = response.headers.get("Content-Disposition") || "";
  let filename = "download";

  // Parse: attachment; filename="My_Video.mp4"
  // Also handles: attachment; filename*=UTF-8''My%20Video.mp4
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
  if (filenameMatch) {
    filename = decodeURIComponent(filenameMatch[1].trim());
  }

  // Fallback: use content-type to determine extension
  if (!filename.includes(".")) {
    const ct = response.headers.get("Content-Type") || "";
    filename += ct.includes("audio") ? ".mp3" : ".mp4";
  }

  // Read as blob
  const blob = await response.blob();

  if (blob.size === 0) {
    throw new Error("Received empty file from server.");
  }

  // Create object URL and trigger download
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  // Revoke after download starts
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
