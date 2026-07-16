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
  title: "Downloader – Free YouTube TikTok Instagram Facebook Video Downloader",
  description:
    "Download videos from YouTube, TikTok, Instagram, and Facebook for FREE. No signup, no limits, no watermark. The only free downloader that supports all 4 platforms at once.",
  keywords: [
    "free video downloader",
    "youtube downloader free",
    "tiktok downloader no watermark",
    "instagram reels downloader",
    "facebook video downloader",
    "social media downloader",
    "download youtube video free",
    "tiktok video download",
    "instagram video download free",
    "all in one video downloader",
    "ভিডিও ডাউনলোড",
    "youtube video download",
  ],
  openGraph: {
    title: "Downloader – Free Downloader for YouTube, TikTok, Instagram & Facebook",
    description: "The only 100% free tool to download from all 4 platforms — no signup, no watermark, no limits.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Downloader – Free Video Downloader",
    description: "Download from YouTube, TikTok, Instagram & Facebook — free, fast, no limits.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "nJXzdEcrjdsFTdAL7DzX0THrPTqpOD0mrQq3EHAJJuc",
  },
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
