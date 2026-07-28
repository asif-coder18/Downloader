"use client";

import { motion } from "framer-motion";
import { SUPPORTED_PLATFORMS } from "@/lib/mockData";
import { getPlatformGradient } from "@/lib/utils";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function PlatformGrid() {
  return (
    <section className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 dark:bg-violet-500/15 border border-violet-400/20 text-violet-600 dark:text-violet-300 text-xs font-semibold tracking-wide uppercase mb-4">
          Supported Platforms
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Works with all major platforms
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          One tool, every platform. Download from anywhere with a single paste.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {SUPPORTED_PLATFORMS.map((platform) => (
          <motion.div
            key={platform.name}
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl
              bg-white/60 dark:bg-white/[0.04] backdrop-blur-sm
              border border-slate-200/80 dark:border-white/[0.08]
              hover:border-violet-300/60 dark:hover:border-violet-500/30
              hover:bg-white/80 dark:hover:bg-white/[0.07]
              shadow-sm hover:shadow-xl hover:shadow-violet-500/10
              transition-all duration-300 cursor-default overflow-hidden"
          >
            {/* Glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/5 group-hover:to-fuchsia-500/5 transition-all duration-300 rounded-2xl" />

            {/* Icon */}
            <div
              className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${getPlatformGradient(platform.name)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
            >
              {platform.name[0]}
              {/* Shine */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>

            <div className="text-center relative">
              <p className="text-slate-900 dark:text-white font-semibold text-sm">{platform.name}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{platform.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
