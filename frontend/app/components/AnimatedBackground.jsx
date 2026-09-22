"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate normalized mouse offset (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* Light background base */}
      <div className="absolute inset-0 bg-[#ffffff] dark:bg-[#0b0c16] transition-colors duration-500" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf8ff] via-[#ffffff] to-[#faf8ff] dark:opacity-0 transition-opacity duration-500" />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top Center Purple Glow Orb */}
      <motion.div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[550px] rounded-full blur-[130px] opacity-70 dark:opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(217,70,239,0.09) 50%, transparent 70%)",
        }}
        animate={{
          x: mousePos.x * 25,
          y: mousePos.y * 25,
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Top Left Magenta/Purple Orb */}
      <motion.div
        className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full blur-[140px] opacity-60 dark:opacity-35"
        style={{
          background: "radial-gradient(circle, rgba(217,70,239,0.13) 0%, rgba(236,72,153,0.07) 60%, transparent 75%)",
        }}
        animate={{
          x: [0, 40, 0] + mousePos.x * -35,
          y: [0, 30, 0] + mousePos.y * -35,
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Bottom Right Orange/Pink Orb */}
      <motion.div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full blur-[150px] opacity-60 dark:opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(251,146,60,0.14) 0%, rgba(236,72,153,0.08) 55%, transparent 75%)",
        }}
        animate={{
          x: [0, -50, 0] + mousePos.x * 40,
          y: [0, -40, 0] + mousePos.y * 40,
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Bottom Left Deep Violet Orb */}
      <motion.div
        className="absolute -bottom-20 -left-20 w-[550px] h-[550px] rounded-full blur-[130px] opacity-50 dark:opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(217,70,239,0.06) 60%, transparent 75%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: mousePos.x * -20,
          y: mousePos.y * -20,
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Light streak beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60 dark:opacity-100">
        <div className="absolute top-1/4 left-0 w-[200%] h-[2px] bg-gradient-to-r from-transparent via-purple-400/25 to-transparent streak" />
        <div className="absolute top-3/4 left-0 w-[200%] h-[1.5px] bg-gradient-to-r from-transparent via-pink-400/20 to-transparent streak" style={{ animationDelay: "6s" }} />
      </div>

      {/* Soft Floating Light Particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-purple-500/20 dark:bg-white/20 blur-[1px]"
            style={{
              width: `${(i % 3) + 3}px`,
              height: `${(i % 3) + 3}px`,
              left: `${15 + i * 15}%`,
              top: `${80 - (i * 10)}%`,
            }}
            animate={{
              y: [0, -120, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      {/* Subtle grid dot mesh */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124, 58, 237, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 58, 237, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
        }}
      />
    </div>
  );
}