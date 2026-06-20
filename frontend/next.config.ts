import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow thumbnails from all common social media CDNs
    remotePatterns: [
      // YouTube / Google
      { protocol: "https", hostname: "**.ytimg.com" },
      { protocol: "https", hostname: "**.ggpht.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      // Instagram / Facebook
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.facebook.com" },
      // TikTok
      { protocol: "https", hostname: "**.tiktokcdn.com" },
      { protocol: "https", hostname: "**.tiktokcdn-us.com" },
      { protocol: "https", hostname: "p16-sign.tiktokcdn-us.com" },
      { protocol: "https", hostname: "p19-sign.tiktokcdn-us.com" },
      // Twitter/X
      { protocol: "https", hostname: "**.twimg.com" },
      // Vimeo
      { protocol: "https", hostname: "**.vimeocdn.com" },
      // Reddit
      { protocol: "https", hostname: "**.redd.it" },
      { protocol: "https", hostname: "**.redditmedia.com" },
      // Picsum (used in mock data)
      { protocol: "https", hostname: "picsum.photos" },
      // Catch-all for any other CDN thumbnails
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
