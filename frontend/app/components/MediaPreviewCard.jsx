"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Music, Copy, Share2, Clock, Eye, CheckCircle, Loader2 } from "lucide-react";
import { QUALITY_OPTIONS } from "@/lib/mockData";
import { getPlatformGradient, copyToClipboard } from "@/lib/utils";
import ProgressBar from "./ProgressBar";

function DownloadBtn({ icon: Icon, label, colorClass, onClick, disabled, loading }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center gap-2
        py-3 px-4 rounded-xl text-sm font-semibold text-white
        transition-all duration-200 shadow-lg overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        ${colorClass}
      `}
    >
      {/* Shine on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-500" />
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin relative" />
      ) : (
        <Icon className="w-4 h-4 relative" />
      )}
      <span className="relative">{label}</span>
    </motion.button>
  );
}

export default function MediaPreviewCard({
  media,
  onDownload,
  isDownloading    = false,
  downloadProgress = 0,
  downloadLabel    = "",
  downloadState    = "idle",
  activeFormat     = null,
}) {
  const [selectedQuality, setSelectedQuality] = useState("best");
  const [copied, setCopied] = useState(false);

  const formats = (media.formats || ["video", "audio"]).filter(
    (f) => f === "video" || f === "audio"
  );
  const qualities = (media.qualities || ["best", "1080p", "720p"]).filter(q => q !== "360p");
  const availableQualities = QUALITY_OPTIONS.filter((q) => qualities.includes(q.value));

  const handleDownloadClick = (format) => {
    if (isDownloading) return;
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
      try { await navigator.share({ title: media.title, url: media._url }); return; }
      catch { /* cancelled */ }
    }
    handleCopy();
  };

  const isDone  = downloadState === "done";
  const isError = downloadState === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full rounded-2xl overflow-hidden
        bg-white/70 dark:bg-white/[0.05] backdrop-blur-md
        border border-slate-200/80 dark:border-white/[0.09]
        shadow-xl shadow-slate-200/50 dark:shadow-black/30"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-slate-900">
        {media.thumbnail ? (
          <Image
            src={media.thumbnail}
            alt={media.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 700px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-900/60 to-fuchsia-900/40">
            <Download className="w-16 h-16 text-violet-400/30" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Platform badge */}
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getPlatformGradient(media.platform)} shadow-md`}
        >
          {media.platform}
        </motion.span>

        {/* Duration */}
        {media.duration && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-mono">
            <Clock className="w-3 h-3" />
            {media.duration}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">

        {/* Title */}
        <h2 className="text-slate-900 dark:text-white font-semibold text-base leading-snug line-clamp-2">
          {media.title}
        </h2>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
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

        {/* Quality selector */}
        <div>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mb-2.5 uppercase tracking-wide">Quality</p>
          <div className="flex flex-wrap gap-2">
            {availableQualities.map((q) => (
              <motion.button
                key={q.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedQuality(q.value)}
                disabled={isDownloading}
                className={`
                  px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${selectedQuality === q.value
                    ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/30"
                    : "bg-white/60 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-violet-400/50 dark:hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-300"
                  }
                `}
              >
                {q.badge && <span className="mr-1">{q.badge}</span>}
                {q.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <AnimatePresence>
          {(isDownloading || isDone || isError) && (
            <ProgressBar
              key="progress"
              progress={downloadProgress}
              label={downloadLabel}
              isError={isError}
              isDone={isDone}
            />
          )}
        </AnimatePresence>

        {/* Download buttons */}
        <div className="grid grid-cols-2 gap-3">
          {formats.includes("video") && (
            <DownloadBtn
              icon={Download}
              label="Video"
              colorClass="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-violet-500/25"
              onClick={() => handleDownloadClick("Video")}
              disabled={isDownloading}
              loading={isDownloading && activeFormat === "Video"}
            />
          )}
          {formats.includes("audio") && (
            <DownloadBtn
              icon={Music}
              label="Audio"
              colorClass="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-blue-500/25"
              onClick={() => handleDownloadClick("Audio")}
              disabled={isDownloading}
              loading={isDownloading && activeFormat === "Audio"}
            />
          )}
        </div>

        {/* Copy / Share */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
              bg-slate-100/80 dark:bg-white/[0.05] hover:bg-slate-200/80 dark:hover:bg-white/10
              border border-slate-200/80 dark:border-white/[0.08]
              text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white
              text-xs font-medium transition-all duration-200"
          >
            {copied
              ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
              : <><Copy className="w-3.5 h-3.5" /> Copy Link</>
            }
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
              bg-slate-100/80 dark:bg-white/[0.05] hover:bg-slate-200/80 dark:hover:bg-white/10
              border border-slate-200/80 dark:border-white/[0.08]
              text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white
              text-xs font-medium transition-all duration-200"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>
    </motion.div>
  );
}
