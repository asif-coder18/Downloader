"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AudioWaveform, UploadCloud, FileAudio2, X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { denoiseUpload, API_BASE } from "@/lib/api";
import { isFileTooLarge, MAX_UPLOAD_SIZE_MB, formatBytes } from "@/lib/utils";
import ProgressBar from "./ProgressBar";

const STEP_STATE = {
  IDLE:      "idle",
  PROCESSING: "processing",  // server removing noise
  DONE:      "done",
  ERROR:     "error",
};

const MIME_ACCEPT = "video/*,audio/*,.mkv,.mov,.avi,.webm,.flv,.wmv,.m4v,.mpg,.mpeg,.3gp,.ts,.ogg,.oga,.opus,.flac,.wma,.mp3,.wav,.m4a,.aac";

export default function DenoiseForm({ onToast }) {
  const [file,        setFile]        = useState(null);
  const [mode,        setMode]        = useState("music");
  const [boost,       setBoost]       = useState(true);
  const [dragOver,    setDragOver]    = useState(false);
  const [state,       setState]       = useState(STEP_STATE.IDLE);
  const [progress,    setProgress]    = useState(0);
  const [label,       setLabel]       = useState("");
  const [error,       setError]       = useState("");
  const inputRef = useRef(null);

  const busy = state === STEP_STATE.PROCESSING;

  const triggerAnchorDownload = (token, filename) => {
    const a = document.createElement("a");
    a.href = `${API_BASE}/api/file/${token}`;
    a.download = filename || "noise_free.mp3";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 1000);
  };

  const resetAfterDelay = () => {
    setTimeout(() => {
      setState(STEP_STATE.IDLE);
      setProgress(0);
      setLabel("");
      setError("");
      setFile(null);
    }, 5000);
  };

  const selectFile = useCallback((selected) => {
    if (busy) return;
    if (!selected) return;
    setError("");
    setLabel("");
    setState(STEP_STATE.IDLE);
    setProgress(0);
    if (isFileTooLarge(selected)) {
      setError(`File is ${formatBytes(selected.size)} — exceeds the ${MAX_UPLOAD_SIZE_MB}MB size limit. Please upload a smaller file.`);
      setFile(null);
      return;
    }
    setFile(selected);
  }, [busy]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) selectFile(dropped);
  }, [selectFile]);

  const handleUploadSubmit = async () => {
    if (!file || busy) return;

    setError("");
    setState(STEP_STATE.PROCESSING);
    setLabel(`Uploading & removing noise from ${file.name}…`);

    try {
      const data = await denoiseUpload(file, (p) => setProgress(p), mode, boost);
      setLabel("Download starting…");
      triggerAnchorDownload(data.token, data.filename);

      setState(STEP_STATE.DONE);
      setProgress(100);
      setLabel("Noise removed and saved to your device!");
      onToast?.({ type: "success", message: "✅ Noise-free MP3 saved!", duration: 5000 });
      resetAfterDelay();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Noise removal failed. Please try again.";
      setState(STEP_STATE.ERROR);
      setError(msg);
      setLabel(msg);
      onToast?.({ type: "error", message: msg, duration: 8000 });
      setProgress(0);
      setTimeout(() => {
        setState(STEP_STATE.IDLE);
        setLabel("");
      }, 5000);
    }
  };

  const isError = state === STEP_STATE.ERROR;
  const isDone  = state === STEP_STATE.DONE;
  const showProgress = state === STEP_STATE.PROCESSING || isDone || isError;

  return (
    <div className="w-full space-y-4">

      {/* Dropzone */}
      <motion.div
        whileHover={{ scale: busy ? 1 : 1.01 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => { if (!busy) inputRef.current?.click(); }}
        className={`relative rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200
          border-2 border-dashed
          ${dragOver
            ? "border-blue-500 bg-blue-500/10"
            : busy
              ? "border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.04] opacity-70"
              : "border-slate-300 dark:border-white/15 bg-white/70 dark:bg-white/[0.04] hover:border-blue-400/70"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={MIME_ACCEPT}
          className="hidden"
          onChange={(e) => selectFile(e.target.files?.[0])}
        />

        {/* Icon */}
        <motion.div
          animate={{ y: dragOver ? [-4, 4, -4] : 0 }}
          transition={{ duration: 1, repeat: dragOver ? Infinity : 0 }}
          className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4
            ${dragOver
              ? "bg-blue-600 text-white"
              : "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300"}
          `}
        >
          <AudioWaveform className="w-8 h-8" />
        </motion.div>

        <p className="text-gray-800 dark:text-white font-semibold text-lg mb-1">
          {dragOver ? "Drop it here!" : "Upload a video or audio to clean"}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          MP4, MKV, MOV, WebM… or MP3, WAV, M4A, FLAC…
        </p>

        {/* Selected file chip */}
        <AnimatePresence>
          {file && state !== STEP_STATE.DONE && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 max-w-full"
            >
              <FileAudio2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate max-w-[220px]">
                {file.name}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (!busy) { setFile(null); setError(""); setState(STEP_STATE.IDLE); } }}
                className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mode + boost options */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1">
          {[
            { key: "music", label: "🎵 Keep music",     desc: "Removes hiss & hum, keeps music" },
            { key: "voice", label: "🎙 Vocal focus",    desc: "Kills background chatter, keeps the main voice" },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              type="button"
              disabled={busy}
              onClick={() => setMode(key)}
              title={desc}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              } ${busy ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        <label
          className={`inline-flex items-center gap-2 cursor-pointer select-none text-sm text-slate-500 dark:text-slate-400 ${
            busy ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={boost}
            disabled={busy}
            onChange={(e) => setBoost(e.target.checked)}
            className="accent-blue-600 w-4 h-4"
          />
          🔊 Boost volume
        </label>
      </div>
      <p className="text-center text-xs text-slate-400 dark:text-slate-500 -mt-2">
        {mode === "voice"
          ? "Vocal focus: background people, fan & hiss removed — music becomes quieter."
          : "Keep music: background noise removed, the song plays normally."}
      </p>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 dark:text-red-400 text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <AnimatePresence>
        {showProgress && (
          <ProgressBar
            progress={progress}
            label={label}
            isError={isError}
            isDone={isDone}
          />
        )}
      </AnimatePresence>

      {/* Remove noise button */}
      <motion.button
        type="button"
        onClick={handleUploadSubmit}
        disabled={!file || busy}
        whileHover={{ scale: !file || busy ? 1 : 1.015 }}
        whileTap={{ scale: !file || busy ? 1 : 0.985 }}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl
          bg-gradient-to-r from-blue-600 to-blue-500
          hover:from-blue-500 hover:to-blue-400
          disabled:opacity-50 disabled:cursor-not-allowed
          text-white font-semibold text-sm
          shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50
          transition-all duration-200"
      >
        {busy ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Removing noise…
          </>
        ) : isDone ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Done!
          </>
        ) : (
          <>
            <AudioWaveform className="w-5 h-5" />
            Remove Noise &amp; Download
          </>
        )}
      </motion.button>
    </div>
  );
}