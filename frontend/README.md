# SocialDL – Universal Social Media Downloader

A beautiful, modern, frontend-only social media downloader built with **Next.js**, **Tailwind CSS**, **Framer Motion**, and **Lucide React**.

## ✨ Features

- 🎯 **Auto platform detection** – paste any URL and the app identifies the platform instantly
- 📺 **Media preview card** – thumbnail, title, duration, views, channel
- ⬇️ **Multiple download formats** – Video, Audio, MP3, Reel
- 🎚️ **Quality selector** – 360p, 720p, 1080p, Best
- 📊 **Download progress bar** – animated real-time progress
- 🕐 **Download history** – persisted in localStorage with search & filter
- 🌙 **Dark/Light mode** – system preference + manual toggle
- 🔔 **Toast notifications** – success, error, info, warning
- 📱 **Fully responsive** – mobile, tablet, desktop
- ✨ **Smooth animations** – Framer Motion throughout
- 🎨 **Glassmorphism UI** – premium SaaS design

## 🌐 Supported Platforms

| Platform  | Formats                    |
|-----------|----------------------------|
| YouTube   | Video, Shorts, Audio, MP3  |
| TikTok    | Video, Reel, MP3           |
| Instagram | Reel, Video, Audio         |
| Facebook  | Video, Audio, MP3          |

## 📁 Project Structure

```
my-app/
├── app/
│   ├── components/
│   │   ├── AnimatedBackground.jsx   # Floating gradient orbs
│   │   ├── FeaturesSection.jsx      # Home page features grid
│   │   ├── Footer.jsx               # Site footer
│   │   ├── HeroSection.jsx          # Home page hero
│   │   ├── HistoryCard.jsx          # Single history entry card
│   │   ├── MediaPreviewCard.jsx     # Media info + download buttons
│   │   ├── Navbar.jsx               # Sticky navigation bar
│   │   ├── PlatformGrid.jsx         # Supported platforms grid
│   │   ├── ProgressBar.jsx          # Download progress bar
│   │   ├── SkeletonCard.jsx         # Loading skeleton
│   │   ├── ToastContainer.jsx       # Toast notification stack
│   │   └── UrlInputForm.jsx         # URL paste + submit form
│   ├── about/
│   │   └── page.jsx                 # About page
│   ├── downloader/
│   │   └── page.jsx                 # Main downloader page
│   ├── history/
│   │   └── page.jsx                 # Download history page
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
├── hooks/
│   ├── useDownloadHistory.js        # History state + localStorage
│   ├── useTheme.js                  # Dark/light mode
│   └── useToast.js                  # Toast notifications
├── lib/
│   ├── mockData.js                  # Mock API data + platform detection
│   └── utils.js                     # Shared utility functions
└── public/                          # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/socialdl.git
cd socialdl/my-app

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## ☁️ Deploy to Vercel

The easiest way to deploy is with [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel auto-detects Next.js — click **Deploy**
5. Your app is live in ~60 seconds!

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## 🛠️ Tech Stack

| Technology     | Version  | Purpose                    |
|----------------|----------|----------------------------|
| Next.js        | 16.x     | React framework (App Router)|
| React          | 19.x     | UI library                 |
| Tailwind CSS   | 4.x      | Utility-first styling      |
| Framer Motion  | 12.x     | Animations                 |
| Lucide React   | Latest   | Icon library               |

## ⚠️ Important Note

This is a **frontend-only** demo application. All media fetching is simulated with mock data. No actual downloads occur. To make it functional, you would need to integrate a real backend API (e.g., yt-dlp, cobalt.tools API, etc.).

## 📄 License

MIT License — free to use, modify, and distribute.
