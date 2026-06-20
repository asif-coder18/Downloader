/**
 * components/UrlInputForm.jsx
 * ----------------------------
 * The main URL paste/input form.
 * Features:
 * - Large input field with paste button
 * - Real-time platform detection badge
 * - Animated submit button
 * - Validation feedback
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Search, X, Clipboard, Loader2 } from "lucide-react";
import { detectPlatform, isValidUrl } from "@/lib/mockData";
import { isValidUrl as validateUrl } from "@/lib/utils";
import { getPlatformGradient } from "@/lib/utils";

export default function UrlInputForm({ onSubmit, isLoading }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  // Detect platform as user types
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

  const handleClear = () => {
    setUrl("");
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }
    if (!validateUrl(url.trim())) {
      setError("That doesn't look like a valid URL. Try something like https://youtube.com/watch?v=...");
      return;
    }
    setError("");
    onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Link2 className="w-5 h-5" />
        </div>

        {/* URL input */}
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(""); }}
          placeholder="Paste your YouTube, TikTok, Instagram link here…"
          className="w-full pl-12 pr-36 py-4 rounded-2xl bg-slate-200/50 dark:bg-white/10 backdrop-blur-sm border border-slate-300/60 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
          disabled={isLoading}
          aria-label="Social media URL"
        />

        {/* Right side: paste / clear buttons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {url && (
            <button
              type="button"
              onClick={handleClear}
              className="w-8 h-8 rounded-lg bg-slate-300/50 dark:bg-white/10 hover:bg-slate-300/80 dark:hover:bg-white/20 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-300/50 dark:bg-white/10 hover:bg-slate-300/80 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all"
            aria-label="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" />
            Paste
          </button>
        </div>
      </div>

      {/* Platform detection badge */}
      <AnimatePresence>
        {platform && url && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-2 flex items-center gap-2"
          >
            <span className="text-slate-400 text-xs">Detected:</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getPlatformGradient(platform.name)}`}
            >
              {platform.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
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
