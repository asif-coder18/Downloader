/**
 * app/about/page.jsx  →  About Page  (/about)
 * ---------------------------------------------
 * Informational page with:
 * - Mission statement
 * - Stats grid
 * - FAQ accordion
 * - CTA section
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Download, Users, Globe, Zap } from "lucide-react";
import { STATS, FAQS } from "@/lib/mockData";
import Link from "next/link";

// ─── Stat Card ────────────────────────────────────────────────────────────────

const STAT_ICONS = { Download, Users, Globe, Zap };

function StatCard({ stat, index }) {
  const Icon = STAT_ICONS[stat.icon] || Zap;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
      <p className="text-slate-600 dark:text-slate-400 text-sm">{stat.label}</p>
    </motion.div>
  );
}

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-slate-900 dark:text-white font-medium text-sm pr-4">{faq.q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-slate-500 dark:text-slate-400"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-5 pb-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-200/50 dark:border-white/10 pt-3">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          About{" "}
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            SocialDL
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          SocialDL is a free, open-source universal social media downloader. Our mission is to make it effortless for anyone to save content they love — videos, reels, shorts, and audio — from any platform.
        </p>
      </motion.div>

      {/* ── Stats ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">By the Numbers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/20"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          We believe content you discover should be yours to keep. Whether it&apos;s a tutorial you want to watch offline, a reel that made you laugh, or a song you want to listen to on the go — SocialDL makes it simple.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          We support 8+ platforms and are constantly adding more. Our tool is completely free, requires no account, and has no download limits.
        </p>
      </motion.section>

      {/* ── FAQ ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Ready to get started?</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">It takes less than 10 seconds to download your first video.</p>
        <Link
          href="/downloader"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105 active:scale-95"
        >
          <Download className="w-5 h-5" />
          Start Downloading Free
        </Link>
      </motion.div>
    </div>
  );
}
