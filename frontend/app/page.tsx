/**
 * app/page.tsx  →  Home Page  (/)
 * ---------------------------------
 * Landing page with:
 * - Hero section (headline + CTA)
 * - Platform grid
 * - Features section
 * - Quick-start CTA banner
 */

import HeroSection from "./components/HeroSection";
import PlatformGrid from "./components/PlatformGrid";
import FeaturesSection from "./components/FeaturesSection";
import Link from "next/link";
import { Download, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Supported Platforms ── */}
      <PlatformGrid />

      {/* ── Features ── */}
      <FeaturesSection />

      {/* ── Bottom CTA Banner ── */}
      <section className="py-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-600/30 via-purple-600/30 to-pink-600/30 border border-slate-200/60 dark:border-white/10 p-10 text-center">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-pink-600/10 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to download?
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-8 max-w-md mx-auto">
              Paste your first link and get your media in seconds. No sign-up, no limits.
            </p>
            <Link
              href="/downloader"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-5 h-5" />
              Try it now — it&apos;s free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
