/**
 * components/FeaturesSection.jsx
 * --------------------------------
 * A 3-column feature highlights section for the home page.
 */

"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Globe, Music, Film, Download } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Our optimized pipeline fetches and prepares your download in under 3 seconds.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Safe & Private",
    description: "No account needed. We don't store your URLs or personal data.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Globe,
    title: "4+ Platforms",
    description: "YouTube, TikTok, Instagram, Facebook.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Music,
    title: "Audio Extraction",
    description: "Extract high-quality MP3 audio from any video with one click.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Film,
    title: "Multiple Formats",
    description: "Download as Video, Audio, MP3, or Reel — you choose the format.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Download,
    title: "No Limits",
    description: "Download as many videos as you want. No daily caps, no paywalls.",
    gradient: "from-indigo-500 to-blue-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Why Choose SocialDL?</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Built for speed, simplicity, and reliability. Everything you need, nothing you don't.
        </p>
      </div>

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
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-100/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
