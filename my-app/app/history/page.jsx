/**
 * app/history/page.jsx  →  History Page  (/history)
 * ---------------------------------------------------
 * Shows all previously downloaded media.
 * Features:
 * - Search bar to filter by title or platform
 * - Filter chips by format (All / Video / Audio / MP3 / Reel)
 * - Animated list with HistoryCard components
 * - Clear all button
 * - Empty state illustration
 */

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Clock, Download } from "lucide-react";
import HistoryCard from "@/app/components/HistoryCard";
import ToastContainer from "@/app/components/ToastContainer";
import { useDownloadHistory } from "@/hooks/useDownloadHistory";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";

const FORMAT_FILTERS = ["All", "Video", "Audio"];

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useDownloadHistory();
  const { toasts, addToast, removeToast } = useToast();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Filter history based on search query and format filter
  const filtered = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.platform.toLowerCase().includes(search.toLowerCase());
      const matchesFormat =
        activeFilter === "All" || item.format === activeFilter;
      return matchesSearch && matchesFormat;
    });
  }, [history, search, activeFilter]);

  const handleRemove = (id) => {
    removeFromHistory(id);
    addToast({ type: "info", message: "Removed from history." });
  };

  const handleClearAll = () => {
    clearHistory();
    addToast({ type: "warning", message: "History cleared." });
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">
              Download History
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {history.length} item{history.length !== 1 ? "s" : ""} in your history
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-sm font-medium transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </motion.div>

        {/* ── Search + Filter ── */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 space-y-3"
          >
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or platform…"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-200/50 dark:bg-white/10 backdrop-blur-sm border border-slate-300/60 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
            </div>

            {/* Format filter chips */}
            <div className="flex flex-wrap gap-2">
              {FORMAT_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeFilter === f
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-slate-200/50 dark:bg-white/5 border-slate-300/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/20"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── History List ── */}
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div className="space-y-3">
              {filtered.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                />
              ))}
            </motion.div>
          ) : history.length === 0 ? (
            /* Empty state – no history at all */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-5">
                <Clock className="w-9 h-9 text-slate-500" />
              </div>
              <h2 className="text-slate-900 dark:text-white font-semibold text-xl mb-2">No downloads yet</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                Your download history will appear here after you download your first video.
              </p>
              <Link
                href="/downloader"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm hover:scale-105 transition-transform"
              >
                <Download className="w-4 h-4" />
                Download something
              </Link>
            </motion.div>
          ) : (
            /* Empty state – search/filter returned nothing */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">No results for &quot;{search}&quot;</p>
              <button
                onClick={() => { setSearch(""); setActiveFilter("All"); }}
                className="mt-3 text-violet-400 hover:text-violet-300 text-sm transition-colors"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
