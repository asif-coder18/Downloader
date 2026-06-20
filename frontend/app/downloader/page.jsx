"use client";

/**
 * app/downloader/page.jsx
 * ========================
 * Downloader page — connected to the real FastAPI backend.
 *
 * DOWNLOAD FLOW (two-step):
 *   1. User pastes URL → POST /api/analyze → show media card
 *   2. User clicks download → POST /api/download/video → get token
 *   3. Browser navigates to /api/file/{token} → file saves to Downloads
 *
 * BUG FIXES (multi-download support):
 *   - useRef for dlState guard prevents stale-closure blocking second downloads
 *   - resetDownloadState() is a stable ref-based reset callable from anywhere
 *   - activeFormat is lifted to page level so it resets with download state
 *   - showSaveFilePicker is called BEFORE the async fetch (preserves user gesture)
 */

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import UrlInputForm from "@/app/components/UrlInputForm";
import MediaPreviewCard from "@/app/components/MediaPreviewCard";
import SkeletonCard from "@/app/components/SkeletonCard";
import ToastContainer from "@/app/components/ToastContainer";
import { analyzeUrl, downloadVideo, downloadAudio } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useDownloadHistory } from "@/hooks/useDownloadHistory";

// ── Download state machine ────────────────────────────────────────────────────
const DL_STATE = {
  IDLE:      "idle",
  PREPARING: "preparing",  // yt-dlp is downloading server-side
  DONE:      "done",
  ERROR:     "error",
};

export default function DownloaderPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaInfo,   setMediaInfo]   = useState(null);
  const [analyzeErr,  setAnalyzeErr]  = useState("");

  const [dlState,     setDlState]     = useState(DL_STATE.IDLE);
  const [dlProgress,  setDlProgress]  = useState(0);
  const [dlLabel,     setDlLabel]     = useState("");
  const [activeFormat, setActiveFormat] = useState(null);

  // ── Use a ref to track downloading state to avoid stale closures ──────────
  // Reading dlState inside handleDownload's setTimeout would capture a stale
  // value. The ref always reflects the latest value synchronously.
  const dlStateRef = useRef(DL_STATE.IDLE);
  const resetTimerRef = useRef(null);

  const { toasts, addToast, removeToast } = useToast();
  const { addToHistory } = useDownloadHistory();

  // ── Stable reset function — safe to call from any async context ───────────
  const resetDownloadState = useCallback(() => {
    // Cancel any pending auto-reset timer
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    dlStateRef.current = DL_STATE.IDLE;
    setDlState(DL_STATE.IDLE);
    setDlProgress(0);
    setDlLabel("");
    setActiveFormat(null);
  }, []);

  // ── Analyze ────────────────────────────────────────────────────────────────
  const handleAnalyze = useCallback(async (url) => {
    // Reset download state when analyzing a new URL
    resetDownloadState();
    setIsAnalyzing(true);
    setMediaInfo(null);
    setAnalyzeErr("");

    try {
      const data = await analyzeUrl(url);
      setMediaInfo({ ...data, _url: url });
      addToast({ type: "success", message: `Found: ${data.title.slice(0, 55)}` });
    } catch (err) {
      const msg = err.message || "Could not fetch media info.";
      setAnalyzeErr(msg);
      addToast({ type: "error", message: msg });
    } finally {
      setIsAnalyzing(false);
    }
  }, [addToast, resetDownloadState]);

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async (format, quality) => {
    // Guard against concurrent downloads — use ref, not state, to avoid
    // stale closure issues between renders
    if (!mediaInfo || dlStateRef.current === DL_STATE.PREPARING) return;

    // Cancel any pending auto-reset from a previous download
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    dlStateRef.current = DL_STATE.PREPARING;
    setDlState(DL_STATE.PREPARING);
    setDlProgress(0);
    setDlLabel(`Preparing ${format} · ${quality}…`);
    setActiveFormat(format);

    // Fake progress ticker — yt-dlp doesn't stream progress over HTTP,
    // so we animate slowly to 85% to show activity, then jump to 100 on success.
    let fakeProgress = 10;
    const ticker = setInterval(() => {
      fakeProgress = Math.min(fakeProgress + Math.random() * 3, 85);
      setDlProgress(Math.floor(fakeProgress));
    }, 800);

    try {
      const onProgress = (p) => setDlProgress(p);

      const normalizedQuality = quality.toLowerCase().replace(/^best$/i, "best");

      if (format === "Audio") {
        await downloadAudio(mediaInfo._url, onProgress);
      } else {
        await downloadVideo(mediaInfo._url, normalizedQuality, onProgress);
      }

      clearInterval(ticker);

      dlStateRef.current = DL_STATE.DONE;
      setDlState(DL_STATE.DONE);
      setDlProgress(100);
      setDlLabel("Download completed and saved successfully!");
      setActiveFormat(null);

      addToHistory(mediaInfo, format, quality);
      addToast({
        type: "success",
        message: `✅ ${format} download complete!`,
        duration: 5000,
      });

      // Auto-reset after 4 seconds so the next download can start
      resetTimerRef.current = setTimeout(() => {
        resetDownloadState();
      }, 4000);

    } catch (err) {
      clearInterval(ticker);

      const msg = err.message || "Download failed. Please try again.";

      dlStateRef.current = DL_STATE.ERROR;
      setDlState(DL_STATE.ERROR);
      setDlProgress(0);
      setDlLabel(msg);
      setActiveFormat(null);

      addToast({ type: "error", message: msg, duration: 8000 });

      // Auto-reset after 5 seconds so the user can retry immediately
      resetTimerRef.current = setTimeout(() => {
        resetDownloadState();
      }, 5000);
    }
  }, [mediaInfo, addToast, addToHistory, resetDownloadState]);

  const isDownloading = dlState === DL_STATE.PREPARING;

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-3">
            Download
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Paste a link from any supported platform and hit download.
          </p>
        </motion.div>

        {/* ── URL Input ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <UrlInputForm onSubmit={handleAnalyze} isLoading={isAnalyzing} />
        </motion.div>

        {/* ── Analyze error ── */}
        <AnimatePresence>
          {analyzeErr && (
            <motion.div
              key="analyze-err"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm font-medium">{analyzeErr}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Download done banner ── */}
        <AnimatePresence>
          {dlState === DL_STATE.DONE && (
            <motion.div
              key="dl-done"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-emerald-300 text-sm font-medium">
                Download complete! You can download another video now.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Skeleton ── */}
        <AnimatePresence>
          {isAnalyzing && <SkeletonCard key="skeleton" />}
        </AnimatePresence>

        {/* ── Media card ── */}
        <AnimatePresence>
          {mediaInfo && !isAnalyzing && (
            <MediaPreviewCard
              key="media-card"
              media={mediaInfo}
              onDownload={handleDownload}
              isDownloading={isDownloading}
              downloadProgress={dlProgress}
              downloadLabel={dlLabel}
              downloadState={dlState}
              activeFormat={activeFormat}
            />
          )}
        </AnimatePresence>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
