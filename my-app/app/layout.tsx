/**
 * app/layout.tsx
 * ---------------
 * Root layout — wraps every page with:
 * - Font setup (Geist)
 * - Global CSS
 * - Navbar + Footer (shared across all pages)
 * - AnimatedBackground (decorative)
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";
import { ThemeProvider } from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SocialDL – Universal Social Media Downloader",
  description:
    "Download videos, reels, shorts, and audio from YouTube, TikTok, Instagram, and Facebook — free, fast, and unlimited.",
  keywords: ["social media downloader", "youtube downloader", "tiktok downloader", "instagram reels downloader"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Decorative animated background */}
          <AnimatedBackground />

          {/* Sticky top navigation */}
          <Navbar />

          {/* Page content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
