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
 * WHY TWO STEPS?
 *   - Step 1 (POST) waits while yt-dlp downloads the file server-side
 *   - Step 2 (GET) lets the browser stream the file natively
 *   - No RAM buffering, no blob errors, works on mobile
 */

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import UrlInputForm from "@/app/components/UrlInputForm";
import MediaPreviewCard from "@/app/components/MediaPreviewCard";
import SkeletonCard from "@/app/components/SkeletonCard";
import ToastContainer from "@/app/components/ToastContainer";
import { analyzeUrl, downloadVideo, downloadAudio } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useDownloadHistory } from "@/hooks/useDownloadHistory";

// Example URLs removed

// Download state machine
const DL_STATE = {
  IDLE:       "idle",
  PREPARING:  "preparing",   // yt-dlp is downloading server-side
  READY:      "ready",       // file ready, browser download starting
  DONE:       "done",
  ERROR:      "error",
};

// Labels shown to the user for each state
const DL_LABELS = {
  [DL_STATE.IDLE]:      "",
  [DL_STATE.PREPARING]: "Preparing your file… this may take a minute",
  [DL_STATE.READY]:     "Saving file…",
  [DL_STATE.DONE]:      "Download completed and saved successfully!",
  [DL_STATE.ERROR]:     "",
};

export default function DownloaderPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaInfo,   setMediaInfo]   = useState(null);
  const [analyzeErr,  setAnalyzeErr]  = useState("");

  const [dlState,    setDlState]    = useState(DL_STATE.IDLE);
  const [dlProgress, setDlProgress] = useState(0);
  const [dlLabel,    setDlLabel]    = useState("");

  const { toasts, addToast, removeToast } = useToast();
  const { addToHistory } = useDownloadHistory();

  // ── Analyze ────────────────────────────────────────────────────────────────
  const handleAnalyze = useCallback(async (url) => {
    setIsAnalyzing(true);
    setMediaInfo(null);
    setAnalyzeErr("");
    setDlState(DL_STATE.IDLE);

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
  }, [addToast]);

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async (format, quality) => {
    if (!mediaInfo || dlState === DL_STATE.PREPARING) return;

    setDlState(DL_STATE.PREPARING);
    setDlProgress(0);
    setDlLabel(`Preparing ${format} · ${quality}…`);

    // Progress ticker — shows activity while yt-dlp works server-side
    // We can't get real progress from yt-dlp over HTTP, so we simulate it
    // by slowly advancing to 85% then waiting for the server response.
    let fakeProgress = 10;
    const ticker = setInterval(() => {
      fakeProgress = Math.min(fakeProgress + Math.random() * 3, 85);
      setDlProgress(Math.floor(fakeProgress));
    }, 800);

    try {
      const onProgress = (p) => {
        // Real progress from the fetch call (10 → 80 → 90 → 100)
        setDlProgress(p);
      };

      if (format === "Audio") {
        await downloadAudio(mediaInfo._url, onProgress);
      } else {
        // Normalize quality: "Best" → "best", "720p" → "720p"
        const q = quality.toLowerCase().replace(/^best$/i, "best");
        await downloadVideo(mediaInfo._url, q, onProgress);
      }

      clearInterval(ticker);
      setDlProgress(100);
      setDlState(DL_STATE.DONE);
      setDlLabel(DL_LABELS[DL_STATE.DONE]);

      addToHistory(mediaInfo, format, quality);
      addToast({
        type: "success",
        message: `✅ ${format} download completed and saved successfully!`,
        duration: 6000,
      });

      // Reset after 4 seconds
      setTimeout(() => {
        setDlState(DL_STATE.IDLE);
        setDlProgress(0);
        setDlLabel("");
      }, 4000);

    } catch (err) {
      clearInterval(ticker);
      const msg = err.message || "Download failed. Please try again.";
      setDlState(DL_STATE.ERROR);
      setDlLabel(msg);
      setDlProgress(0);
      addToast({ type: "error", message: msg, duration: 8000 });

      // Reset error state after 5 seconds
      setTimeout(() => {
        setDlState(DL_STATE.IDLE);
        setDlLabel("");
      }, 5000);
    }
  }, [mediaInfo, dlState, addToast, addToHistory]);

  const isDownloading = dlState === DL_STATE.PREPARING || dlState === DL_STATE.READY;

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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-medium">{analyzeErr}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Download done banner ── */}
        <AnimatePresence>
          {dlState === DL_STATE.DONE && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-emerald-300 text-sm font-medium">
                Download completed and saved successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Skeleton ── */}
        <AnimatePresence>
          {isAnalyzing && <SkeletonCard />}
        </AnimatePresence>

        {/* ── Media card ── */}
        <AnimatePresence>
          {mediaInfo && !isAnalyzing && (
            <MediaPreviewCard
              media={mediaInfo}
              onDownload={handleDownload}
              isDownloading={isDownloading}
              downloadProgress={dlProgress}
              downloadLabel={dlLabel || DL_LABELS[dlState]}
              downloadState={dlState}
            />
          )}
        </AnimatePresence>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
