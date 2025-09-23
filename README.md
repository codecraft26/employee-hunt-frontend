# Bann Dhann - Progressive Web App

A modern Progressive Web App (PWA) for team activities, quizzes, treasure hunts, and polls. Built with Next.js, TypeScript, and Tailwind CSS.
## 🚀 PWA Features
- **🔄 Offline Support**: Works without internet connection
- **📱 App-like Experience**: Install on mobile and desktop
- 
- **🔔 Push Notifications**: Stay updated with team activities
- **⚡ Fast Loading**: Optimized caching and performance
- **🎮 Gaming UI**: Beautiful, interactive design
- **📊 Real-time Updates**: Live sync when online






## 🛠️ Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Export static files
npm run export
```

## 📱 PWA Installation

### Mobile (Android/iOS)
1. Open the app in your mobile browser
2. Look for the "Install App" prompt or
3. Tap the browser menu → "Add to Home Screen"

### Desktop
1. Open the app in Chrome, Edge, or Safari
2. Look for the install icon in the address bar
3. Click "Install" when prompted

## 🎯 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **PWA**: next-pwa, Custom Service Worker
- **Icons**: Lucide React
- **Authentication**: NextAuth.js

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # Redux store
├── types/              # TypeScript types
├── utils/              # Utility functions
└── globals.css         # Global styles

public/
├── icons/              # PWA icons
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
└── offline.html       # Offline fallback page
```

## 🎮 Features

- **Team Management**: Create and manage teams
- **Quizzes**: Interactive quiz system with real-time scoring
- **Treasure Hunts**: Location-based challenges
- **Polls**: Team voting and feedback
- **Photo Wall**: Team photo sharing
- **Admin Dashboard**: Comprehensive management tools

## 🌐 Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://backend.banndhann.com/api
NEXT_PUBLIC_COLLAGE_API_URL=https://backend.banndhann.com/api/photo-wall/generate-collage
```

## 🔧 PWA Configuration

The app includes:
- **Manifest**: `/public/manifest.json`
- **Service Worker**: Custom caching strategies
- **Offline Page**: Branded offline experience
- **Icons**: Multiple sizes for all devices
- **Meta Tags**: Full PWA optimization

## 📊 Performance

- Lighthouse Score: 95+ for PWA
- Offline-first architecture
- Optimized caching strategies
- Background sync capabilities

## 🚀 Deployment

Deploy on Vercel with automatic PWA optimization:

```bash
npm run build
npm run export
```

## 📄 License

MIT License - see LICENSE file for details.
