/**
 * components/Footer.jsx
 * ----------------------
 * Modern footer with brand info, nav links, and social icons.
 */

"use client";

import Link from "next/link";
import { Download, GitBranch } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "Downloader", href: "/downloader" },
    { label: "History",    href: "/history" },
    { label: "About",      href: "/about" },
  ],
  Platforms: [
    { label: "YouTube",   href: "/downloader" },
    { label: "Instagram", href: "/downloader" },
    { label: "TikTok",    href: "/downloader" },
    { label: "Facebook",  href: "/downloader" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200/80 dark:border-white/10 bg-slate-100/30 dark:bg-slate-950/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                <Download className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                Social<span className="text-violet-600 dark:text-violet-400">DL</span>
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              The fastest and most reliable social media downloader. Download videos, reels, shorts, and audio from 4+ platforms.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="#"
                aria-label="GitHub"
                className="w-9 h-9 rounded-lg bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300/50 dark:hover:bg-white/20 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-300/30 dark:border-transparent"
              >
                <GitBranch className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-4">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 Asiful Maula Abir. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
