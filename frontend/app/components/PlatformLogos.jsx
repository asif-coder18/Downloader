"use client";

/**
 * PlatformLogos.jsx
 * High quality, crystal-clear SVG logos for TikTok, Instagram, and Facebook.
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
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ig-grad-icon" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="15%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="100%" stopColor="#285AEB" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad-icon)" strokeWidth="2.2" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#ig-grad-icon)" strokeWidth="2.2" />
      <circle cx="17.5" cy="6.5" r="1.4" fill="url(#ig-grad-icon)" />
    </svg>
  );
}

export function FacebookLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M15.143 24v-9.293h3.119l.467-3.62h-3.586V8.776c0-1.048.291-1.762 1.794-1.762l1.917-.001V3.766C18.522 3.722 17.382 3.621 16.05 3.621c-2.781 0-4.685 1.698-4.685 4.815v2.691H8.243v3.62h3.122V24h3.778z"
        fill="#FFFFFF"
      />
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

