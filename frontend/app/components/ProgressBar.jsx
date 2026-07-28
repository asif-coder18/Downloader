"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ProgressBar({ progress, label, isError = false, isDone = false }) {
  const barColor = isError
    ? "bg-gradient-to-r from-red-500 to-rose-400"
    : isDone
    ? "bg-gradient-to-r from-emerald-400 to-teal-400"
    : "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500";

  const bgColor = isError
    ? "bg-red-500/8 dark:bg-red-500/10 border-red-500/20"
    : isDone
    ? "bg-emerald-500/8 dark:bg-emerald-500/10 border-emerald-500/20"
    : "bg-violet-500/5 dark:bg-white/[0.04] border-violet-400/20 dark:border-white/10";

  const Icon = isError ? XCircle : isDone ? CheckCircle2 : Loader2;
  const iconColor = isError ? "text-red-400" : isDone ? "text-emerald-400" : "text-violet-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className={`w-full rounded-2xl p-4 border ${bgColor}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor} ${!isError && !isDone ? "animate-spin" : ""}`} />
          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">
            {label || (isDone ? "Download complete!" : isError ? "Download failed" : "Preparing…")}
          </span>
        </div>
        {!isError && (
          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums ml-2 flex-shrink-0">
            {progress}%
          </span>
        )}
      </div>

      {/* Track */}
      <div className="h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: isError ? "100%" : `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.4 }}
        />
      </div>

      {/* Hint text */}
      {!isError && !isDone && progress < 90 && (
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-2.5">
          Processing on server — this may take a moment…
        </p>
      )}
      {isDone && (
        <p className="text-emerald-500 dark:text-emerald-400 text-xs mt-2.5">
          Check your Downloads folder
        </p>
      )}
    </motion.div>
  );
}
