"use client";

/**
 * PlatformLogos.jsx
 * High quality SVG logos for TikTok, Instagram, and Facebook.
 */

export function TikTokLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201-1.743 2.895 2.895 0 0 1 2.312-1.392h.088v-3.454a6.345 6.345 0 0 0-1.116.098 6.342 6.342 0 1 0 6.342 6.342V9.335a8.277 8.277 0 0 0 4.79 1.516V7.4a4.83 4.83 0 0 1-.01-.714z" />
    </svg>
  );
}

export function InstagramLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="100%" stopColor="#285AEB" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad)" strokeWidth="2.2" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#ig-grad)" strokeWidth="2.2" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="url(#ig-grad)" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

export function FacebookLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function PlatformLogo({ name, className = "w-5 h-5" }) {
  const norm = (name || "").toLowerCase();
  if (norm.includes("tiktok")) return <TikTokLogo className={className} />;
  if (norm.includes("instagram")) return <InstagramLogo className={className} />;
  if (norm.includes("facebook") || norm.includes("fb")) return <FacebookLogo className={className} />;
  return null;
}
