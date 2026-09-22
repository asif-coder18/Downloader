"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TikTokLogo, InstagramLogo, FacebookLogo } from "@/app/components/PlatformLogos";
import { Download, Heart } from "lucide-react";

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
      <svg className="absolute inset-0 w-full h-full opacity-40 dark:opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#d946ef" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="line-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {/* Left top arc */}
        <motion.path
          d="M -100,140 Q 220,90 380,340 T 750,620"
          fill="none"
          stroke="url(#line-grad-1)"
          strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        {/* Right bottom arc */}
        <motion.path
          d="M 1250,180 Q 920,420 780,680 T 180,880"
          fill="none"
          stroke="url(#line-grad-2)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 3.5, ease: "easeInOut", delay: 0.4 }}
        />
      </svg>

      {/* ── Left Side Floating TikTok Card ── */}
      <motion.div
        className="hidden lg:block absolute left-[3.5%] top-[18%]"
        animate={{
          x: mousePos.x * -0.8,
          y: [0, -16, 0] + mousePos.y * -0.8,
          rotate: [-6, -2, -6],
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="glass-card p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-white/[0.05] backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-purple-500/10 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 group hover:scale-110 transition-transform">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-md group-hover:shadow-pink-500/30 transition-shadow">
            <TikTokLogo className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </motion.div>

      {/* ── Left Decorative Handwritten Text: "Videos Made Simple" ── */}
      <motion.div
        className="hidden xl:block absolute left-[3%] top-[45%] text-slate-400 font-serif italic text-sm tracking-wider -rotate-12 select-none"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="font-serif italic text-base sm:text-lg text-purple-600/80 dark:text-purple-300/80 leading-tight block">Videos</span>
        <span className="font-serif italic text-lg sm:text-xl text-pink-500/80 dark:text-pink-300/80 leading-tight block">Made Simple</span>
        <svg className="w-12 h-3 text-pink-400/60 mt-1" viewBox="0 0 100 20" fill="none">
          <path d="M 5,10 Q 50,18 95,8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* ── Left Bottom Floating Cloud Card: "Download Without Limits" ── */}
      <motion.div
        className="hidden lg:block absolute left-[3%] bottom-[10%]"
        animate={{
          x: mousePos.x * -0.5,
          y: [0, 14, 0] + mousePos.y * -0.5,
          rotate: [4, 1, 4],
        }}
        transition={{
          y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 },
        }}
      >
        <div className="glass-card p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-white/[0.05] backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-purple-500/10 flex flex-col items-center justify-center w-48 sm:w-56 text-center group">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 mb-3 group-hover:scale-110 transition-transform">
            <Download className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white leading-tight">
            Download <br />
            <span className="text-purple-600 dark:text-purple-300 font-bold">Without Limits</span>
          </span>
          <svg className="w-14 h-2 text-pink-400/70 mt-2" viewBox="0 0 100 15" fill="none">
            <path d="M 10,8 Q 50,15 90,5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>

      {/* ── Right Top Side Floating Instagram Card ── */}
      <motion.div
        className="hidden lg:block absolute right-[4%] top-[16%]"
        animate={{
          x: mousePos.x * 0.9,
          y: [0, -18, 0] + mousePos.y * 0.9,
          rotate: [6, 2, 6],
        }}
        transition={{
          y: { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          rotate: { duration: 7.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="glass-card p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-white/[0.05] backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-pink-500/10 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 group hover:scale-110 transition-transform">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <InstagramLogo className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
        </div>
      </motion.div>

      {/* ── Right Top Decorative Handwritten Text: "Fast • Secure • Free" ── */}
      <motion.div
        className="hidden xl:block absolute right-[3%] top-[14%] text-slate-400 font-serif italic text-xs sm:text-sm tracking-wider rotate-6 text-right select-none"
        animate={{
          y: [0, -6, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <span className="text-purple-600/80 dark:text-purple-300/80 font-serif italic text-base sm:text-lg block">Fast</span>
        <span className="text-pink-500/80 dark:text-pink-300/80 font-serif italic text-lg sm:text-xl block">Secure</span>
        <span className="text-orange-500/80 dark:text-orange-300/80 font-serif italic text-lg sm:text-xl block">Free</span>
        <svg className="w-14 h-3 text-orange-400/70 ml-auto mt-1" viewBox="0 0 100 20" fill="none">
          <path d="M 5,10 Q 50,18 95,8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* ── Right Lower Side Floating Facebook Card ── */}
      <motion.div
        className="hidden lg:block absolute right-[3.5%] top-[46%]"
        animate={{
          x: mousePos.x * 0.7,
          y: [0, 16, 0] + mousePos.y * 0.7,
          rotate: [-6, -2, -6],
        }}
        transition={{
          y: { duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
        }}
      >
        <div className="glass-card p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-white/[0.05] backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-blue-500/10 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 group hover:scale-110 transition-transform">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#1877F2] flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FacebookLogo className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>
      </motion.div>

      {/* ── Right Bottom Decorative Text: "Your Favorite Videos Always With You" ── */}
      <motion.div
        className="hidden xl:block absolute right-[3%] bottom-[12%] text-right select-none -rotate-6"
        animate={{
          y: [0, 8, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <Heart className="w-5 h-5 text-purple-500 fill-purple-500/20 ml-auto mb-1 animate-pulse" />
        <span className="font-serif italic text-base sm:text-lg text-slate-700 dark:text-slate-200 block font-semibold leading-tight">Your</span>
        <span className="font-serif italic text-lg sm:text-xl text-purple-600 dark:text-purple-300 block leading-tight">Favorite Videos</span>
        <span className="font-serif italic text-base sm:text-lg text-pink-500 dark:text-pink-300 block leading-tight">Always With You</span>
        <svg className="w-16 h-3 text-pink-400/70 ml-auto mt-1" viewBox="0 0 100 20" fill="none">
          <path d="M 5,10 Q 50,18 95,8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>

    </div>
  );
}

