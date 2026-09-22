"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-slate-200/60 dark:border-white/[0.07]">
      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
              >
                <Download className="w-4 h-4 text-white" />
              </motion.div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Downloader</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              The fastest free social media downloader. No signup, no watermarks, no limits.
            </p>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-4 tracking-wide">Platforms</h3>
            <ul className="space-y-3">
              {["TikTok", "Instagram", "Facebook"].map((platform) => (
                <li key={platform}>
                  <Link
                    href="/"
                    className="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 text-sm transition-colors duration-200"
                  >
                    {platform}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 dark:text-slate-500 text-xs">
            © 2026 Asiful Maula Abir. All rights reserved.
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs">
            Built with ❤️ using Next.js &amp; FastAPI
          </p>
        </div>
      </div>
    </footer>
  );
}