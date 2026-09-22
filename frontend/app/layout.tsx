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
  title: "Downloader – Free TikTok Instagram Facebook Video Downloader",
  description:
    "Download videos from TikTok, Instagram, and Facebook for FREE. No signup, no limits, no watermark.",
  keywords: [
    "free video downloader",
    "tiktok downloader no watermark",
    "instagram reels downloader",
    "facebook video downloader",
    "social media downloader",
    "tiktok video download",
    "instagram video download free",
    "ভিডিও ডাউনলোড",
  ],
  openGraph: {
    title: "Downloader – Free Downloader for TikTok, Instagram & Facebook",
    description: "The only 100% free tool to download from TikTok, Instagram & Facebook — no signup, no watermark, no limits.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Downloader – Free Video Downloader",
    description: "Download from TikTok, Instagram & Facebook — free, fast, no limits.",
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