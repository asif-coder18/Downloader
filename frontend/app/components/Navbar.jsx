"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/85 dark:bg-[#0b0c16]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.08] shadow-sm shadow-purple-500/5"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo + Tagline */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/25"
            >
              <Download className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">
                Downloader
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 mt-1">
                Save What You Love
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}