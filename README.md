# CleanStream

**Sync reaction videos with official music sources - no copyright issues.**

CleanStream helps YouTube music reaction video creators avoid copyright strikes by syncing their reaction videos with official music sources. Viewers watch the reaction video while hearing the licensed audio from the official source.

## Quick Start

### Prerequisites
- Node.js 18+
- Chrome or Edge browser

### 1. Install Dependencies

```bash
# Web app
cd web
npm install

# Extension
cd ../extension
npm install
```

### 2. Set Up Database

```bash
cd web
DATABASE_URL="file:./dev.db" npx prisma generate
DATABASE_URL="file:./dev.db" npx prisma db push
```

### 3. Run the Web App

```bash
cd web
DATABASE_URL="file:./dev.db" npm run dev
```

Open http://localhost:3000 (or 3001)

### 4. Build & Load Extension

```bash
cd extension
npm run build
```

Then in Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/dist`

## How It Works

1. **Reactor** creates a Sync Pack linking their reaction video to the official track
2. **Viewer** opens the Sync Pack page and follows the guided sync steps
3. **Extension** detects reaction videos and provides sync controls

## Project Structure

```
CleanStream/
├── web/              # Next.js web app + API
│   ├── app/          # Pages and API routes
│   ├── components/   # React components
│   ├── lib/          # Utilities
│   └── prisma/       # Database schema
├── extension/        # Chrome MV3 extension
│   ├── src/          # Extension source
│   └── dist/         # Built extension (load this)
├── docs/             # Documentation
└── TODO.md           # Task tracking
```

## Documentation

- [Overview](docs/00-overview.md) - What we built
- [Local Development](docs/01-local-dev.md) - How to run locally
- [Extension Install](docs/02-extension-install.md) - Load the extension
- [Data Model](docs/03-data-model.md) - Database schema
- [API Reference](docs/04-api.md) - REST API docs

## Tech Stack

- **Web**: Next.js 15, TypeScript, Tailwind CSS
- **Database**: SQLite (dev) / PostgreSQL (prod) via Prisma
- **Extension**: Chrome MV3, TypeScript, Vite

## Features

- Create Sync Packs with reaction + official video URLs
- Guided sync flow for viewers
- Nudge controls (±50ms, ±200ms)
- Local offset persistence
- Rating system for reactions and tracks
- View analytics

## License

MIT
