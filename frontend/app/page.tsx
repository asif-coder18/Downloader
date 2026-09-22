"use client";

/**
 * app/page.tsx
 * ============
 * Single-page downloader — connected to the real FastAPI backend.
 *
 * DOWNLOAD FLOW (two-step):
 *   1. User pastes URL → POST /api/analyze → show media card
 *   2. User clicks download → POST /api/download/video → get token
 *   3. Browser navigates to /api/file/{token} → file saves to Downloads
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Link2, UploadCloud, Zap } from "lucide-react";
import UrlInputForm from "@/app/components/UrlInputForm";
import UploadForm from "@/app/components/UploadForm";
import MediaPreviewCard from "@/app/components/MediaPreviewCard";
import SkeletonCard from "@/app/components/SkeletonCard";
import ToastContainer from "@/app/components/ToastContainer";
import { analyzeUrl, downloadVideo, downloadAudio, checkBackendHealth } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

// ── Download state machine ────────────────────────────────────────────────────
const DL_STATE = {
  IDLE:      "idle",
  PREPARING: "preparing",  // the server is preparing the download
  DONE:      "done",
  ERROR:     "error",
};

interface MediaInfo {
  title: string;
  platform: string;
  thumbnail?: string | null;
  duration?: string | null;
  uploader?: string | null;
  view_count?: string | null;
  formats?: string[];
  qualities?: string[];
  fileSize?: Record<string, string>;
  _url: string;
}

export default function HomePage() {
  const [mode,         setMode]        = useState<"link" | "upload">("link");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaInfo,   setMediaInfo]   = useState<MediaInfo | null>(null);
  const [analyzeErr,  setAnalyzeErr]  = useState("");

  const [dlState,     setDlState]     = useState(DL_STATE.IDLE);
  const [dlProgress,  setDlProgress]  = useState(0);
  const [dlLabel,     setDlLabel]     = useState("");
  const [activeFormat, setActiveFormat] = useState<string | null>(null);

  // ── Use a ref to track downloading state to avoid stale closures ──────────
  const dlStateRef = useRef(DL_STATE.IDLE);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { toasts, addToast, removeToast } = useToast();

  // ── Wake up backend on page load ──────────────────────────────────────────
  useEffect(() => {
    checkBackendHealth().catch(() => {});
  }, []);

  // ── Stable reset function — safe to call from any async context ───────────
  const resetDownloadState = useCallback(() => {
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
  const handleAnalyze = useCallback(async (url: string) => {
    resetDownloadState();
    setIsAnalyzing(true);
    setMediaInfo(null);
    setAnalyzeErr("");

    try {
      const data = await analyzeUrl(url) as MediaInfo;
      setMediaInfo({ ...data, _url: url });
      addToast({ type: "success", message: `Found: ${data.title.slice(0, 55)}` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not fetch media info.";
      setAnalyzeErr(msg);
      addToast({ type: "error", message: msg });
    } finally {
      setIsAnalyzing(false);
    }
  }, [addToast, resetDownloadState]);

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async (format: string, quality: string) => {
    if (!mediaInfo || dlStateRef.current === DL_STATE.PREPARING) return;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    dlStateRef.current = DL_STATE.PREPARING;
    setDlState(DL_STATE.PREPARING);
    setDlProgress(0);
    setDlLabel(`Preparing ${format} · ${quality}…`);
    setActiveFormat(format);

    // Fake progress ticker — the server doesn't stream progress over HTTP,
    // so we animate slowly to 85% to show activity, then jump to 100 on success.
    let fakeProgress = 10;
    const ticker = setInterval(() => {
      fakeProgress = Math.min(fakeProgress + Math.random() * 3, 85);
      setDlProgress(Math.floor(fakeProgress));
    }, 800);

    try {
      const onProgress = (p: number) => setDlProgress(p);

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

      const msg = err instanceof Error ? err.message : "Download failed. Please try again.";

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
  }, [mediaInfo, addToast, resetDownloadState]);

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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-5">
            <Zap className="w-3 h-3" />
            Free · Fast · No Limits
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-white mb-3 tracking-tight">
            Download
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Paste a link or upload a video to convert and download.
          </p>
        </motion.div>

        {/* ── Mode toggle: Paste Link / Upload Video ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setMode("link")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                mode === "link"
                  ? "bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Link2 className="w-4 h-4" />
              Paste Link
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                mode === "upload"
                  ? "bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Upload Video
            </button>
          </div>
        </motion.div>

        {/* ── URL Input ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          {mode === "link" ? (
            <UrlInputForm onSubmit={handleAnalyze} isLoading={isAnalyzing} />
          ) : (
            <UploadForm onToast={addToast} isDownloading={isDownloading} />
          )}
        </motion.div>

        {/* ── Analyze error ── */}
        {mode === "link" && (
          <AnimatePresence>
            {analyzeErr && (
              <motion.div
                key="analyze-err"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm font-medium">{analyzeErr}</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── Download done banner ── */}
        {mode === "link" && (
          <AnimatePresence>
            {dlState === DL_STATE.DONE && (
              <motion.div
                key="dl-done"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                  Download complete! You can download another video now.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── Skeleton ── */}
        {mode === "link" && (
          <AnimatePresence>
            {isAnalyzing && <SkeletonCard key="skeleton" />}
          </AnimatePresence>
        )}

        {/* ── Media card ── */}
        {mode === "link" && (
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
        )}
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}