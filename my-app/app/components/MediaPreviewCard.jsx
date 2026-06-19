/**
 * components/MediaPreviewCard.jsx
 * --------------------------------
 * Shows media info and download buttons.
 * Handles the two-step download state machine.
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Music,
  Copy, Share2, Clock, Eye, CheckCircle, Loader2,
} from "lucide-react";
import { QUALITY_OPTIONS } from "@/lib/mockData";
import { getPlatformGradient, copyToClipboard } from "@/lib/utils";
import ProgressBar from "./ProgressBar";

// ─── Download Button ──────────────────────────────────────────────────────────

function DownloadBtn({ icon: Icon, label, colorClass, onClick, disabled, loading }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center gap-2
        py-2.5 px-3 rounded-xl text-sm font-semibold text-white
        transition-all shadow-lg
        disabled:opacity-60 disabled:cursor-not-allowed
        ${colorClass}
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {label}
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MediaPreviewCard({
  media,
  onDownload,
  isDownloading   = false,
  downloadProgress = 0,
  downloadLabel   = "",
  downloadState   = "idle",
}) {
  const [selectedQuality, setSelectedQuality] = useState("best");
  const [copied, setCopied] = useState(false);
  const [activeFormat, setActiveFormat] = useState(null); // which button was clicked

  const formats   = (media.formats || ["video", "audio"]).filter(
    (f) => f === "video" || f === "audio"
  );
  const qualities = media.qualities || ["best", "1080p", "720p", "360p"];

  const availableQualities = QUALITY_OPTIONS.filter((q) =>
    qualities.includes(q.value)
  );

  const handleDownloadClick = (format) => {
    if (isDownloading) return;
    setActiveFormat(format);
    const qualityLabel = selectedQuality === "best" ? "Best" : selectedQuality;
    onDownload?.(format, qualityLabel);
  };

  const handleCopy = async () => {
    await copyToClipboard(media._url || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share && media._url) {
      try {
        await navigator.share({ title: media.title, url: media._url });
        return;
      } catch { /* user cancelled */ }
    }
    handleCopy();
  };

  const isDone  = downloadState === "done";
  const isError = downloadState === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full rounded-2xl bg-slate-100/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-none"
    >
      {/* ── Thumbnail ── */}
      <div className="relative w-full aspect-video bg-slate-800">
        {media.thumbnail ? (
          <Image
            src={media.thumbnail}
            alt={media.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 700px"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-900/50 to-purple-900/50">
            <Download className="w-16 h-16 text-violet-400/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Platform badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getPlatformGradient(media.platform)}`}>
          {media.platform}
        </span>

        {/* Duration */}
        {media.duration && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-mono">
            <Clock className="w-3 h-3" />
            {media.duration}
          </span>
        )}
      </div>

      {/* ── Info ── */}
      <div className="p-5 space-y-4">

        {/* Title */}
        <h2 className="text-slate-900 dark:text-white font-semibold text-base leading-snug line-clamp-2">
          {media.title}
        </h2>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
          {media.uploader && (
            <span className="font-medium text-slate-700 dark:text-slate-300">{media.uploader}</span>
          )}
          {media.view_count && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {media.view_count} views
            </span>
          )}
          {media.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {media.duration}
            </span>
          )}
        </div>

        {/* ── Quality Selector ── */}
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">Quality</p>
          <div className="flex flex-wrap gap-2">
            {availableQualities.map((q) => (
              <button
                key={q.value}
                onClick={() => setSelectedQuality(q.value)}
                disabled={isDownloading}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${selectedQuality === q.value
                    ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/30"
                    : "bg-slate-200/50 dark:bg-white/5 border-slate-300/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/20"
                  }
                `}
              >
                {q.badge && <span className="mr-1">{q.badge}</span>}
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <AnimatePresence>
          {(isDownloading || isDone || isError) && (
            <ProgressBar
              progress={downloadProgress}
              label={downloadLabel}
              isError={isError}
              isDone={isDone}
            />
          )}
        </AnimatePresence>

        {/* ── Download Buttons ── */}
        <div className="grid grid-cols-2 gap-2.5">
          {formats.includes("video") && (
            <DownloadBtn
              icon={Download}
              label="Video"
              colorClass="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-500/25"
              onClick={() => handleDownloadClick("Video")}
              disabled={isDownloading}
              loading={isDownloading && activeFormat === "Video"}
            />
          )}
          {formats.includes("audio") && (
            <DownloadBtn
              icon={Music}
              label="Audio"
              colorClass="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25"
              onClick={() => handleDownloadClick("Audio")}
              disabled={isDownloading}
              loading={isDownloading && activeFormat === "Audio"}
            />
          )}
        </div>

        {/* ── Copy / Share ── */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 border border-slate-300/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all"
          >
            {copied
              ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Copied!</>
              : <><Copy className="w-3.5 h-3.5" /> Copy Link</>
            }
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 border border-slate-300/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>
    </motion.div>
  );
}
