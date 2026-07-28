"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Search, X, Clipboard, Loader2 } from "lucide-react";
import { detectPlatform } from "@/lib/mockData";
import { isValidUrl as validateUrl, getPlatformGradient } from "@/lib/utils";

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
      setError("Doesn't look like a valid URL. Try something like https://youtube.com/watch?v=...");
      return;
    }
    setError("");
    onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">

      {/* Input container */}
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 3px rgba(139,92,246,0.2), 0 8px 32px rgba(139,92,246,0.12)"
            : "0 2px 8px rgba(0,0,0,0.06)",
        }}
        transition={{ duration: 0.2 }}
        className={`relative rounded-2xl transition-all duration-200
          bg-white/70 dark:bg-white/[0.06] backdrop-blur-sm
          border ${focused
            ? "border-violet-400/60 dark:border-violet-500/50"
            : "border-slate-200/80 dark:border-white/10"
          }`}
      >
        {/* Left icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Link2 className={`w-5 h-5 transition-colors duration-200 ${focused ? "text-violet-500" : "text-slate-400"}`} />
        </div>

        {/* Input */}
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(""); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Paste YouTube, TikTok, Instagram or Facebook link…"
          className="w-full pl-12 pr-36 py-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none rounded-2xl"
          disabled={isLoading}
          aria-label="Social media URL"
        />

        {/* Right buttons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <AnimatePresence>
            {url && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={handleClear}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20
              text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white
              text-xs font-medium transition-all"
          >
            <Clipboard className="w-3.5 h-3.5" />
            Paste
          </button>
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
            className="mt-2.5 flex items-center gap-2"
          >
            <span className="text-slate-400 dark:text-slate-500 text-xs">Detected:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getPlatformGradient(platform.name)}`}>
              {platform.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-red-400 text-xs"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl
          bg-gradient-to-r from-violet-600 to-fuchsia-600
          hover:from-violet-500 hover:to-fuchsia-500
          disabled:opacity-60 disabled:cursor-not-allowed
          text-white font-semibold text-sm
          shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50
          transition-all duration-200"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Fetching media info…
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Fetch &amp; Download
          </>
        )}
      </motion.button>
    </form>
  );
}
