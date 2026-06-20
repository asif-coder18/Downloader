/**
 * components/SkeletonCard.jsx
 * ----------------------------
 * Animated skeleton loading card shown while media info is being fetched.
 * Uses a shimmer animation to indicate loading state.
 */

"use client";

import { motion } from "framer-motion";

// A single shimmer block
function Shimmer({ className }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-slate-200/80 dark:bg-white/10 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/80 dark:via-white/10 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl bg-slate-100/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 overflow-hidden"
    >
      {/* Thumbnail skeleton */}
      <Shimmer className="w-full aspect-video" />

      <div className="p-5 space-y-4">
        {/* Platform badge skeleton */}
        <Shimmer className="h-6 w-24" />

        {/* Title skeleton – two lines */}
        <div className="space-y-2">
          <Shimmer className="h-5 w-full" />
          <Shimmer className="h-5 w-3/4" />
        </div>

        {/* Meta row skeleton */}
        <div className="flex gap-3">
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-4 w-14" />
        </div>

        {/* Quality selector skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-9 w-16" />
          ))}
        </div>

        {/* Download buttons skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <Shimmer className="h-11 rounded-xl" />
          <Shimmer className="h-11 rounded-xl" />
          <Shimmer className="h-11 rounded-xl" />
          <Shimmer className="h-11 rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
}
