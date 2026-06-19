/**
 * components/ProgressBar.jsx
 * ---------------------------
 * Animated download progress bar.
 * Handles: loading, done (green), error (red) states.
 */

"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ProgressBar({ progress, label, isError = false, isDone = false }) {
  const barColor = isError
    ? "bg-gradient-to-r from-red-500 to-rose-400"
    : isDone
    ? "bg-gradient-to-r from-emerald-500 to-green-400"
    : "bg-gradient-to-r from-violet-500 to-purple-400";

  const Icon = isError ? XCircle : isDone ? CheckCircle2 : Loader2;
  const iconColor = isError ? "text-red-400" : isDone ? "text-emerald-400" : "text-violet-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`
        w-full rounded-xl p-4 border
        ${isError
          ? "bg-red-500/10 border-red-500/20"
          : isDone
          ? "bg-emerald-500/10 border-emerald-500/20"
          : "bg-slate-200/50 dark:bg-white/5 border-slate-300/60 dark:border-white/10"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon
            className={`w-4 h-4 flex-shrink-0 ${iconColor} ${
              !isError && !isDone ? "animate-spin" : ""
            }`}
          />
          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">
            {label || (isDone ? "Download complete!" : isError ? "Download failed" : "Preparing…")}
          </span>
        </div>
        {!isError && (
          <span className="text-sm font-bold text-slate-800 dark:text-white tabular-nums ml-2 flex-shrink-0">
            {progress}%
          </span>
        )}
      </div>

      {/* Track */}
      <div className="h-2 w-full rounded-full bg-slate-300/70 dark:bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: isError ? "100%" : `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.4 }}
        />
      </div>

      {/* Sub-label */}
      {!isError && !isDone && progress < 90 && (
        <p className="text-slate-600 dark:text-slate-500 text-xs mt-2">
          yt-dlp is downloading the file on the server…
        </p>
      )}
      {isDone && (
        <p className="text-emerald-500/80 text-xs mt-2">
          Check your browser&apos;s Downloads folder
        </p>
      )}
    </motion.div>
  );
}
