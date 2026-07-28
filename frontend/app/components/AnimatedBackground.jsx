"use client";

import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Deep dark base */}
      <div className="absolute inset-0 bg-[#030712] dark:bg-[#030712] bg-slate-50" />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Primary violet orb — top left */}
      <motion.div
        className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(109,40,217,0.06) 50%, transparent 70%)",
        }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blue orb — top right */}
      <motion.div
        className="absolute -top-24 -right-48 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(37,99,235,0.04) 50%, transparent 70%)",
        }}
        animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Pink orb — bottom center */}
      <motion.div
        className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(236,72,153,0.1) 0%, rgba(168,85,247,0.05) 50%, transparent 70%)",
        }}
        animate={{ scaleX: [1, 1.15, 1], scaleY: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Cyan orb — middle left */}
      <motion.div
        className="absolute top-1/3 -left-24 w-[350px] h-[350px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 65%)",
        }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Light mode overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/95 via-violet-50/60 to-slate-100/95 dark:opacity-0" />
    </div>
  );
}
