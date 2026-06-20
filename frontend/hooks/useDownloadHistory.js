/**
 * hooks/useDownloadHistory.js
 * ---------------------------
 * Manages the download history list.
 * Persists to localStorage so history survives page refreshes.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { INITIAL_HISTORY } from "@/lib/mockData";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "download_history";

export function useDownloadHistory() {
  const [history, setHistory] = useState([]);

  // Load from localStorage on mount (fall back to mock data)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        setHistory(INITIAL_HISTORY);
      }
    } catch {
      setHistory(INITIAL_HISTORY);
    }
  }, []);

  // Persist to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  /**
   * Adds a new entry to the top of the history list.
   * @param {object} mediaInfo - The media metadata object
   * @param {string} format    - e.g. "Video", "Audio", "MP3", "Reel"
   * @param {string} quality   - e.g. "1080p", "720p", "Best"
   */
  const addToHistory = useCallback((mediaInfo, format, quality) => {
    const entry = {
      id: generateId(),
      platform: mediaInfo.platform,
      platformColor: mediaInfo.platformColor,
      title: mediaInfo.title,
      thumbnail: mediaInfo.thumbnail,
      format,
      quality,
      fileSize: mediaInfo.fileSize?.[quality.toLowerCase()] || mediaInfo.fileSize?.best || "—",
      downloadedAt: new Date().toISOString(),
      duration: mediaInfo.duration,
    };
    setHistory((prev) => [entry, ...prev]);
  }, []);

  /**
   * Removes a single history entry by ID.
   */
  const removeFromHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  /**
   * Clears all history.
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
