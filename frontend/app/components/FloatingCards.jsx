"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TikTokLogo, InstagramLogo, FacebookLogo } from "@/app/components/PlatformLogos";
import { UploadCloud } from "lucide-react";

export default function FloatingCards() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-5">

      {/* Decorative SVG Curved Glow Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Left top arc */}
        <motion.path
          d="M -100,120 Q 200,80 350,320 T 700,600"
          fill="none"
          stroke="url(#line-grad-1)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        {/* Right bottom arc */}
        <motion.path
          d="M 1200,200 Q 900,450 750,700 T 200,900"
          fill="none"
          stroke="url(#line-grad-2)"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 3.5, ease: "easeInOut", delay: 0.5 }}
        />
      </svg>

      {/* ── Left Side Floating TikTok Card ── */}
      <motion.div
        className="hidden lg:block absolute left-[4%] top-[24%]"
        animate={{
          x: mousePos.x * -0.8,
          y: [0, -16, 0] + mousePos.y * -0.8,
          rotate: [-4, -1, -4],
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="glass-card p-5 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10 flex items-center justify-center w-28 h-28 group hover:scale-110 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-900 to-black flex items-center justify-center border border-white/15 shadow-lg group-hover:shadow-pink-500/30 transition-shadow">
            <TikTokLogo className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </motion.div>

      {/* ── Left Decorative Handwritten Text: "Videos Made Simple" ── */}
      <motion.div
        className="hidden xl:block absolute left-[3%] top-[48%] text-slate-400/60 font-serif italic text-sm tracking-wider -rotate-12"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="font-sans font-medium text-xs text-purple-400/70 block leading-tight">Videos</span>
        <span className="font-serif italic text-base text-pink-300/80 leading-tight">Made Simple</span>
      </motion.div>

      {/* ── Left Bottom Floating Cloud Icon Card ── */}
      <motion.div
        className="hidden lg:block absolute left-[5%] bottom-[12%]"
        animate={{
          x: mousePos.x * -0.5,
          y: [0, 14, 0] + mousePos.y * -0.5,
          rotate: [6, 2, 6],
        }}
        transition={{
          y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 },
        }}
      >
        <div className="glass-card p-4 rounded-3xl backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-center w-24 h-24">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-900/60 to-purple-600/40 flex items-center justify-center border border-purple-400/20 text-purple-300">
            <UploadCloud className="w-7 h-7" />
          </div>
        </div>
      </motion.div>

      {/* ── Right Side Floating Instagram Card ── */}
      <motion.div
        className="hidden lg:block absolute right-[5%] top-[20%]"
        animate={{
          x: mousePos.x * 0.9,
          y: [0, -18, 0] + mousePos.y * 0.9,
          rotate: [5, 2, 5],
        }}
        transition={{
          y: { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          rotate: { duration: 7.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="glass-card p-5 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl shadow-pink-500/10 flex items-center justify-center w-28 h-28 group hover:scale-110 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-900/80 via-pink-900/70 to-rose-900/80 flex items-center justify-center border border-pink-400/20 shadow-lg group-hover:shadow-pink-500/40 transition-shadow">
            <InstagramLogo className="w-8 h-8" />
          </div>
        </div>
      </motion.div>

      {/* ── Right Decorative Handwritten Text: "Fast • Secure • Free" ── */}
      <motion.div
        className="hidden xl:block absolute right-[4%] top-[12%] text-slate-400/60 font-serif italic text-xs tracking-wider rotate-6 text-right"
        animate={{
          y: [0, -6, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <span className="text-pink-400/70 block">Fast</span>
        <span className="text-purple-300/80 block">Secure</span>
        <span className="text-orange-400/70 block">Free</span>
      </motion.div>

      {/* ── Right Side Floating Facebook Card ── */}
      <motion.div
        className="hidden lg:block absolute right-[4%] top-[52%]"
        animate={{
          x: mousePos.x * 0.7,
          y: [0, 16, 0] + mousePos.y * 0.7,
          rotate: [-6, -2, -6],
        }}
        transition={{
          y: { duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
        }}
      >
        <div className="glass-card p-5 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-500/10 flex items-center justify-center w-28 h-28 group hover:scale-110 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-900 to-blue-700 flex items-center justify-center border border-blue-400/25 shadow-lg group-hover:shadow-blue-500/40 transition-shadow">
            <FacebookLogo className="w-8 h-8 text-white" />
          </div>
        </div>
      </motion.div>

      {/* ── Right Bottom Decorative Text: "Download Without Limits" ── */}
      <motion.div
        className="hidden xl:block absolute right-[3%] bottom-[16%] text-slate-400/50 font-serif italic text-xs tracking-wide -rotate-6 text-right"
        animate={{
          y: [0, 8, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <span className="text-purple-400/70 block">Download</span>
        <span className="text-pink-400/70 block">Without</span>
        <span className="text-orange-400/70 block font-bold">Limits</span>
      </motion.div>

    </div>
  );
}
