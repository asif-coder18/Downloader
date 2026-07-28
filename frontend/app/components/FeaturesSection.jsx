"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Globe, Music, Film, Download } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized pipeline fetches and prepares your download in seconds.",
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-orange-500/20",
  },
  {
    icon: Shield,
    title: "Safe & Private",
    description: "No account needed. We never store your URLs or personal data.",
    gradient: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: Globe,
    title: "4+ Platforms",
    description: "YouTube, TikTok, Instagram, Facebook — all in one place.",
    gradient: "from-sky-400 to-blue-500",
    glow: "shadow-blue-500/20",
  },
  {
    icon: Music,
    title: "Audio Extraction",
    description: "Extract high-quality MP3 audio from any video with one click.",
    gradient: "from-pink-400 to-rose-500",
    glow: "shadow-pink-500/20",
  },
  {
    icon: Film,
    title: "Multiple Formats",
    description: "Download as Video or Audio — you choose the format and quality.",
    gradient: "from-violet-400 to-purple-500",
    glow: "shadow-violet-500/20",
  },
  {
    icon: Download,
    title: "No Limits",
    description: "Unlimited downloads. No daily caps, no paywalls, ever.",
    gradient: "from-indigo-400 to-blue-500",
    glow: "shadow-indigo-500/20",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function FeaturesSection() {
  return (
    <section className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 dark:bg-violet-500/15 border border-violet-400/20 text-violet-600 dark:text-violet-300 text-xs font-semibold tracking-wide uppercase mb-4">
          Why Choose Us
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Built for everyone
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Speed, privacy, and simplicity — without compromise.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="group relative p-6 rounded-2xl
                bg-white/60 dark:bg-white/[0.04] backdrop-blur-sm
                border border-slate-200/80 dark:border-white/[0.08]
                hover:border-slate-300/80 dark:hover:border-white/[0.14]
                hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/30
                transition-all duration-300 overflow-hidden"
            >
              {/* Subtle corner glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg ${feature.glow} relative`}>
                <Icon className="w-5 h-5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 to-transparent" />
              </div>

              <h3 className="text-slate-900 dark:text-white font-semibold text-base mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
