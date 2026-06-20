/**
 * components/ToastContainer.jsx
 * ------------------------------
 * Renders a stack of toast notifications in the bottom-right corner.
 * Receives `toasts` array and `removeToast` function as props.
 *
 * Toast types: "success" | "error" | "info" | "warning"
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

// Icon and color config per toast type
const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-500/20 border-emerald-500/30",
    icon_color: "text-emerald-400",
    text: "text-emerald-100",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-500/20 border-red-500/30",
    icon_color: "text-red-400",
    text: "text-red-100",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/20 border-blue-500/30",
    icon_color: "text-blue-400",
    text: "text-blue-100",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/20 border-amber-500/30",
    icon_color: "text-amber-400",
    text: "text-amber-100",
  },
};

function Toast({ toast, onRemove }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl max-w-sm w-full ${config.bg}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.icon_color}`} />
      <p className={`text-sm font-medium flex-1 ${config.text}`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function ToastContainer({ toasts, removeToast }) {
  return (
    // Fixed position stack in bottom-right
    <div className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
