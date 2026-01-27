# Local Development Guide

## Prerequisites

- **Node.js** 18+ (download from https://nodejs.org)
- **npm** (comes with Node.js)
- **VS Code** (recommended)
- **Chrome/Edge** (for extension testing)

## Quick Start

### 1. Clone and Install

```bash
# Navigate to project folder
cd CleanStream

# Install web app dependencies
cd web
npm install

# Install extension dependencies
cd ../extension
npm install
cd ..
```

### 2. Set Up Database

```bash
cd web

# Generate Prisma client
DATABASE_URL="file:./dev.db" npx prisma generate

# Create database and tables
DATABASE_URL="file:./dev.db" npx prisma db push
```

### 3. Start the Web App

```bash
cd web
DATABASE_URL="file:./dev.db" npm run dev
```

The app will start at http://localhost:3000 (or 3001 if 3000 is in use).

### 4. Build the Extension

```bash
cd extension
npm run build
```

This creates a `dist/` folder with the built extension.

### 5. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder
5. The CleanStream extension should appear

## Development Workflow

### Web App Development

The web app uses Next.js with hot reload:

```bash
cd web
DATABASE_URL="file:./dev.db" npm run dev
```

- Edit files in `web/app/` and changes appear instantly
- API routes are in `web/app/api/`
- Components are in `web/components/`

### Extension Development

For extension changes:

```bash
cd extension
npm run build
```

Then reload the extension in Chrome:
1. Go to `chrome://extensions`
2. Click the refresh icon on CleanStream

For faster development with watch mode:

```bash
cd extension
npm run dev
```

### Database Management

View and edit data with Prisma Studio:

```bash
cd web
DATABASE_URL="file:./dev.db" npx prisma studio
```

This opens a GUI at http://localhost:5555

## Common Tasks

### Create a Test Sync Pack

1. Open http://localhost:3000/create
2. Enter any two YouTube URLs
3. Set an offset (try 0 or 500ms)
4. Click "Create Sync Pack"
5. You'll be redirected to the watch page

### Test the API

```bash
# Create a sync pack
curl -X POST http://localhost:3000/api/sync-packs \
  -H "Content-Type: application/json" \
  -d '{
    "reactionYoutubeUrl": "https://youtube.com/watch?v=abc123",
    "officialYoutubeUrl": "https://youtube.com/watch?v=xyz789",
    "reactionTitle": "My Reaction",
    "officialTitle": "Official Song",
    "baseOffsetMs": 500
  }'

# List sync packs
curl http://localhost:3000/api/sync-packs
```

### Reset the Database

```bash
cd web
rm -f prisma/dev.db
DATABASE_URL="file:./dev.db" npx prisma db push
```

## Environment Variables

The web app uses these environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite or PostgreSQL connection | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Auth encryption key | dev secret |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` |

For local development, the defaults work fine. For production, update these in `.env.local` or your hosting platform.

## Troubleshooting

### "Port 3000 is in use"

Next.js will automatically use port 3001. Or kill the process:
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
pkill -f "next dev"
```

### "DATABASE_URL not found"

Always prefix Prisma commands with the environment variable:
```bash
DATABASE_URL="file:./dev.db" npx prisma <command>
```

Or create a `.env` file in the `web/` folder.

### Extension not loading

1. Make sure you ran `npm run build` in the extension folder
2. Check the `extension/dist` folder exists
3. Reload the extension in Chrome
4. Check the Chrome DevTools console for errors

### Prisma client errors

Regenerate the client:
```bash
cd web
DATABASE_URL="file:./dev.db" npx prisma generate
```
