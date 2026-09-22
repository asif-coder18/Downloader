"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Search, X, Clipboard, Loader2 } from "lucide-react";
import { detectPlatform } from "@/lib/mockData";
import { isValidUrl as validateUrl, getPlatformGradient } from "@/lib/utils";
import { PlatformLogo, TikTokLogo, InstagramLogo, FacebookLogo } from "@/app/components/PlatformLogos";

export default function UrlInputForm({ onSubmit, isLoading }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const platform = detectPlatform(url);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError("");
    } catch {
      setError("Could not read clipboard. Please paste manually.");
    }
  };

  const handleClear = () => { setUrl(""); setError(""); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) { setError("Please enter a URL."); return; }
    if (!validateUrl(url.trim())) {
      setError("Doesn't look like a valid URL. Try something like https://www.instagram.com/reel/...");
      return;
    }
    const SUPPORTED_DOMAINS = /instagram\.com|tiktok\.com|twitter\.com|x\.com|facebook\.com|fb\.watch|vimeo\.com|reddit\.com|pinterest\.com/i;
    if (!SUPPORTED_DOMAINS.test(url.trim())) {
      setError("Unsupported site. Supported: TikTok, Instagram, Facebook, Twitter/X, Vimeo, Reddit, Pinterest.");
      return;
    }
    setError("");
    onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">

      {/* Input container */}
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 10px 40px -10px rgba(217, 70, 239, 0.25), 0 0 0 2px rgba(236, 72, 153, 0.4)"
            : "0 10px 30px -10px rgba(124, 58, 237, 0.08)",
        }}
        transition={{ duration: 0.3 }}
        className={`relative rounded-2xl transition-all duration-300
          bg-white dark:bg-slate-900/60 backdrop-blur-xl
          border ${focused
            ? "border-pink-500"
            : "border-slate-200/90 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/20"
          }`}
      >
        {/* Left icon */}
        <div className="absolute left-4.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Link2 className={`w-5 h-5 transition-colors duration-300 ${focused ? "text-purple-600 dark:text-purple-400" : "text-slate-400"}`} />
        </div>

        {/* Input */}
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(""); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Paste TikTok, Instagram or Facebook link…"
          className="w-full pl-12 pr-36 py-4.5 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-sm sm:text-base focus:outline-none rounded-2xl font-medium"
          disabled={isLoading}
          aria-label="Social media URL"
        />

        {/* Right buttons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <AnimatePresence>
            {url && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={handleClear}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl
              bg-slate-100 dark:bg-white/10 hover:bg-purple-100/80 dark:hover:bg-white/20
              border border-slate-200/80 dark:border-white/10
              text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-white
              text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200"
          >
            <Clipboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Paste
          </motion.button>
        </div>
      </motion.div>

      {/* Platform badge */}
      <AnimatePresence>
        {platform && url && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Detected:</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getPlatformGradient(platform.name)} shadow-md`}>
              <PlatformLogo name={platform.name} className="w-3.5 h-3.5" />
              {platform.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supported Platforms List with Logos */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Supported:</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 hover:border-pink-400/50 transition-all">
            <TikTokLogo className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
            TikTok
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 hover:border-pink-400/50 transition-all">
            <InstagramLogo className="w-3.5 h-3.5" />
            Instagram
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 hover:border-blue-400/50 transition-all">
            <FacebookLogo className="w-3.5 h-3.5" />
            Facebook
          </span>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-500 text-xs font-semibold text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit CTA button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.025 }}
        whileTap={{ scale: 0.975 }}
        className="w-full flex items-center justify-center gap-2.5 py-4 sm:py-4.5 rounded-2xl
          bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500
          disabled:opacity-60 disabled:cursor-not-allowed
          text-white font-extrabold text-base sm:text-lg tracking-wide
          shadow-xl cta-glow
          transition-all duration-300 relative overflow-hidden group cursor-pointer"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin relative" />
            <span className="relative">Fetching media info…</span>
          </>
        ) : (
          <>
            <Search className="w-5 h-5 relative group-hover:scale-110 transition-transform" />
            <span className="relative">Fetch &amp; Download →</span>
          </>
        )}
      </motion.button>
    </form>
  );
}

