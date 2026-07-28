import HeroSection from "./components/HeroSection";
import PlatformGrid from "./components/PlatformGrid";
import FeaturesSection from "./components/FeaturesSection";
import Link from "next/link";
import { Download, ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <HeroSection />
      <PlatformGrid />
      <FeaturesSection />

      {/* ── CTA Banner ── */}
      <section className="py-20">
        <div className="relative rounded-3xl overflow-hidden p-[1px] bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-pink-500/50">
          <div className="relative rounded-3xl bg-white/70 dark:bg-[#0a0614]/90 backdrop-blur-xl p-10 sm:p-14 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/8 via-fuchsia-600/5 to-pink-600/8" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-600 dark:text-violet-300 text-xs font-semibold mb-6">
                <Sparkles className="w-3 h-3" />
                100% Free · No Sign-up Required
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                Ready to download?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto text-lg">
                Paste your first link and get your media in seconds.
              </p>

              <Link
                href="/downloader"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl
                  bg-gradient-to-r from-violet-600 to-fuchsia-600
                  hover:from-violet-500 hover:to-fuchsia-500
                  text-white font-bold text-base
                  shadow-xl shadow-violet-500/35 hover:shadow-violet-500/55
                  transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]
                  glow-btn"
              >
                <Download className="w-5 h-5" />
                Try it now — it&apos;s free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
