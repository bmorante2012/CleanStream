# CleanStream Overview

## What is CleanStream?

CleanStream is a tool that helps YouTube music reaction video creators avoid copyright strikes by syncing their reaction videos with official music sources. Instead of playing copyrighted music directly in their videos, reactors can use CleanStream to guide viewers to watch the reaction video alongside the official music track.

## The Problem

YouTube music reaction videos often get copyright strikes because the reactor plays the music in their video. This leads to:
- Videos being taken down
- Channel strikes
- Demonetization
- Legal issues

## The Solution

CleanStream provides a "Sync Pack" system that:
1. Stores metadata linking a reaction video to its official music source
2. Guides viewers to open both videos in separate tabs
3. Provides sync controls to keep the videos perfectly aligned
4. Never hosts any copyrighted content - only sync instructions

## How It Works

### For Reactors (Content Creators)

1. Create a Sync Pack by entering:
   - Your reaction video YouTube URL
   - The official music video/audio YouTube URL
   - Base offset timing (how many milliseconds difference)
   - Optional notes for viewers

2. Share the Sync Pack link with your audience

### For Viewers

1. Open a Sync Pack page or visit a reaction video with the extension installed
2. Click "Open Official Track" to open the music in a new tab
3. Follow the guided sync steps
4. Use nudge controls to fine-tune timing if needed
5. Your adjustments are saved locally for future viewing

## Components

### Web App (`/web`)
- **Home Page**: Lists available Sync Packs
- **Create Page**: Form to create new Sync Packs
- **Watch Page**: Viewer experience with sync controls
- **API**: RESTful endpoints for Sync Packs and ratings

### Chrome Extension (`/extension`)
- **Content Script**: Overlay on YouTube pages showing sync status
- **Side Panel**: Full sync controls and nudge buttons
- **Background Worker**: Detects reaction videos with known Sync Packs

## Key Features

- **No Copyright Issues**: We never store or transmit copyrighted audio/video
- **Local Offset Storage**: Viewer adjustments persist across sessions
- **Rating System**: Viewers can rate both the reaction and the original track
- **Analytics**: View counts and engagement metrics
- **Simple UX**: Minimal friction for viewers

## Technology Stack

- **Frontend**: Next.js 15+ with App Router, TypeScript, Tailwind CSS
- **Database**: SQLite (dev) / PostgreSQL (prod) via Prisma ORM
- **Extension**: Chrome Manifest V3, TypeScript, Vite
- **Authentication**: NextAuth.js with magic links (planned)
