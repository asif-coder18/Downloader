/**
 * components/HeroSection.jsx
 * ---------------------------
 * The main hero section on the home page.
 * Features:
 * - Animated headline with gradient text
 * - Subtitle and CTA buttons
 * - Floating stats badges
 * - Scroll-triggered entrance animation
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Play, ArrowRight, Zap, Shield, Globe } from "lucide-react";

// Small floating badge component
function StatBadge({ icon: Icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, type: "spring" }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 dark:bg-white/10 backdrop-blur-sm border border-slate-300/60 dark:border-white/20 text-slate-800 dark:text-white text-sm"
    >
      <Icon className="w-4 h-4 text-violet-400" />
      <span className="font-bold">{value}</span>
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 text-center">
      {/* Announcement badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20 dark:border-violet-500/30 text-violet-600 dark:text-violet-300 text-sm font-medium mb-8"
      >
        <Zap className="w-3.5 h-3.5" />
        Free · No sign-up · Unlimited downloads
      </motion.div>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-6"
      >
        Download Any{" "}
        <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Social Media
        </span>
        <br />
        Video Instantly
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
      >
        Paste any link from YouTube, TikTok, Instagram, or Facebook — and download videos, reels, shorts, and audio in seconds.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
      >
        <Link
          href="/downloader"
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105 active:scale-95"
        >
          <Download className="w-5 h-5" />
          Start Downloading Free
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/about"
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300/50 dark:hover:bg-white/15 border border-slate-300/60 dark:border-white/20 text-slate-700 dark:text-white font-semibold text-base transition-all hover:scale-105 active:scale-95"
        >
          <Play className="w-4 h-4" />
          How it works
        </Link>
      </motion.div>

      {/* Floating stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <StatBadge icon={Download} value="50M+" label="Downloads" delay={0.5} />
        <StatBadge icon={Globe}    value="4+"   label="Platforms"  delay={0.6} />
        <StatBadge icon={Shield}   value="100%" label="Free"       delay={0.7} />
      </motion.div>
    </section>
  );
}
