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
import { AlertTriangle, CheckCircle2, Link2, UploadCloud, Zap, ShieldCheck, Infinity as InfinityIcon } from "lucide-react";
import UrlInputForm from "@/app/components/UrlInputForm";
import UploadForm from "@/app/components/UploadForm";
import MediaPreviewCard from "@/app/components/MediaPreviewCard";
import SkeletonCard from "@/app/components/SkeletonCard";
import ToastContainer from "@/app/components/ToastContainer";
import FloatingCards from "@/app/components/FloatingCards";
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

    // Fake progress ticker
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

      resetTimerRef.current = setTimeout(() => {
        resetDownloadState();
      }, 5000);
    }
  }, [mediaInfo, addToast, resetDownloadState]);

  const isDownloading = dlState === DL_STATE.PREPARING;

  return (
    <>
      {/* Background Interactive Floating Cards */}
      <FloatingCards />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10"
        >
          {/* Pulsing Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-6 badge-glow">
            <Zap className="w-3.5 h-3.5 text-pink-400 fill-pink-400/30" />
            <span>Free • Fast • No Limits</span>
          </div>

          {/* Animated Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-4 leading-none">
            Download <br className="sm:hidden" />
            <span className="gradient-text">Anything, Instantly</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Paste a link or upload a video to convert and download.
          </p>
        </motion.div>

        {/* ── Mode toggle: Paste Link / Upload Video ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-950/70 dark:bg-white/[0.04] border border-white/10 gap-1.5 backdrop-blur-xl shadow-xl">
            <button
              type="button"
              onClick={() => setMode("link")}
              className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mode === "link" ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {mode === "link" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <Link2 className="w-4 h-4 z-10" />
              <span className="z-10">Paste Link</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mode === "upload" ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {mode === "upload" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <UploadCloud className="w-4 h-4 z-10" />
              <span className="z-10">Upload Video</span>
            </button>
          </div>
        </motion.div>

        {/* ── Form Container ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-8"
        >
          {mode === "link" ? (
            <UrlInputForm onSubmit={handleAnalyze} isLoading={isAnalyzing} />
          ) : (
            <UploadForm onToast={addToast} isDownloading={isDownloading} />
          )}
        </motion.div>

        {/* ── Feature Highlights Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-400"
        >
          <div className="flex items-center gap-2 group hover:text-purple-300 transition-colors">
            <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>100% Secure</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800 hidden sm:inline-block" />
          <div className="flex items-center gap-2 group hover:text-pink-300 transition-colors">
            <Zap className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
            <span>Super Fast</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800 hidden sm:inline-block" />
          <div className="flex items-center gap-2 group hover:text-orange-300 transition-colors">
            <InfinityIcon className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            <span>No Registration</span>
          </div>
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
                className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
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
                className="mt-6 p-3 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center gap-2"
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