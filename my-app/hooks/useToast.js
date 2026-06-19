/**
 * hooks/useToast.js
 * -----------------
 * Custom hook for managing toast notifications.
 * Returns a list of active toasts and functions to add/remove them.
 *
 * Usage:
 *   const { toasts, addToast, removeToast } = useToast();
 *   addToast({ type: "success", message: "Downloaded!" });
 */

"use client";

import { useState, useCallback } from "react";
import { generateId } from "@/lib/utils";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  /**
   * Adds a new toast notification.
   * @param {object} options
   * @param {"success"|"error"|"info"|"warning"} options.type
   * @param {string} options.message
   * @param {number} [options.duration=4000] - Auto-dismiss after ms
   */
  const addToast = useCallback(({ type = "info", message, duration = 4000 }) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  }, []);

  /**
   * Manually removes a toast by ID.
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
