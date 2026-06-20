/**
 * components/HistoryCard.jsx
 * ---------------------------
 * A single card in the download history list.
 * Shows thumbnail, title, platform, format, quality, file size, and time.
 * Has a delete button to remove the entry.
 */

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Trash2, Download, Clock, HardDrive } from "lucide-react";
import { timeAgo, getPlatformGradient } from "@/lib/utils";

export default function HistoryCard({ item, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-4 p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-200/50 dark:hover:bg-white/8 transition-all group shadow-sm dark:shadow-none"
    >
      {/* Thumbnail */}
      <div className="relative w-28 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-800">
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          className="object-cover"
          sizes="112px"
          unoptimized
        />
        {/* Duration overlay */}
        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
          {item.duration}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Platform badge + title */}
        <div className="flex items-start gap-2 mb-1">
          <span
            className={`flex-shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${getPlatformGradient(item.platform)}`}
          >
            {item.platform}
          </span>
        </div>
        <p className="text-slate-900 dark:text-white text-sm font-medium leading-snug line-clamp-2 mb-2">
          {item.title}
        </p>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {/* Format */}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300">
            <Download className="w-3 h-3" />
            {item.format}
          </span>
          {/* Quality */}
          <span className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300">{item.quality}</span>
          {/* File size */}
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            {item.fileSize}
          </span>
          {/* Time */}
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {timeAgo(item.downloadedAt)}
          </span>
        </div>
      </div>

      {/* Delete button – visible on hover */}
      <button
        onClick={() => onRemove(item.id)}
        aria-label="Remove from history"
        className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-200/50 dark:bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 border border-slate-300/30 dark:border-transparent"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
