"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Download, ArrowRight, Zap, Shield, Globe, Sparkles } from "lucide-react";

function StatBadge({ icon: Icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring", bounce: 0.3 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-sm shadow-sm"
    >
      <Icon className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
      <span className="font-bold text-slate-900 dark:text-white">{value}</span>
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative pt-36 pb-20 text-center">

      {/* Announcement pill */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8
          bg-violet-500/10 dark:bg-violet-500/15
          border border-violet-400/25 dark:border-violet-400/20
          text-violet-600 dark:text-violet-300 text-sm font-medium"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Free · No sign-up · Unlimited downloads
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.08] tracking-tight mb-6"
      >
        Download Any{" "}
        <span className="relative inline-block">
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Social Media
          </span>
          {/* Underline glow */}
          <motion.span
            className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        </span>
        <br />
        Video Instantly
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="text-slate-500 dark:text-slate-400 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
      >
        Paste any link from YouTube, TikTok, Instagram, or Facebook — get your video in seconds.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
      >
        <Link
          href="/downloader"
          className="group relative flex items-center gap-2 px-8 py-4 rounded-2xl
            bg-gradient-to-r from-violet-600 to-fuchsia-600
            hover:from-violet-500 hover:to-fuchsia-500
            text-white font-bold text-base
            shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50
            transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]
            glow-btn"
        >
          <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          Start Downloading Free
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/about"
          className="flex items-center gap-2 px-8 py-4 rounded-2xl
            bg-white/60 dark:bg-white/5 backdrop-blur-sm
            hover:bg-white/80 dark:hover:bg-white/10
            border border-slate-200 dark:border-white/10
            text-slate-700 dark:text-white font-semibold text-base
            transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]
            shadow-sm"
        >
          How it works
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <StatBadge icon={Download} value="50M+"  label="Downloads" delay={0.55} />
        <StatBadge icon={Globe}    value="4+"     label="Platforms"  delay={0.65} />
        <StatBadge icon={Shield}   value="100%"   label="Free"       delay={0.75} />
        <StatBadge icon={Zap}      value="99.9%"  label="Uptime"     delay={0.85} />
      </motion.div>
    </section>
  );
}
