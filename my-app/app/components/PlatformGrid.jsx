/**
 * components/PlatformGrid.jsx
 * ----------------------------
 * Displays a grid of supported platform cards on the home page.
 * Each card shows the platform name, description, and a colored icon.
 */

"use client";

import { motion } from "framer-motion";
import { SUPPORTED_PLATFORMS } from "@/lib/mockData";
import { getPlatformGradient } from "@/lib/utils";

// Platform initial letter as icon (since we don't have SVG logos)
function PlatformIcon({ name, gradient }) {
  return (
    <div
      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
    >
      {name[0]}
    </div>
  );
}

// Stagger animation for the grid
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PlatformGrid() {
  return (
    <section className="py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Supported Platforms
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Download from all major social media platforms with a single click.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      >
        {SUPPORTED_PLATFORMS.map((platform) => (
          <motion.div
            key={platform.name}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-slate-100/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-200/50 dark:hover:bg-white/8 transition-all cursor-default"
          >
            <PlatformIcon
              name={platform.name}
              gradient={getPlatformGradient(platform.name)}
            />
            <div className="text-center">
              <p className="text-slate-900 dark:text-white font-semibold text-sm">{platform.name}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{platform.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
