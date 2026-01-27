# CleanStream TODO

## Phase 1: Scaffold & Setup ✅
- [x] Create folder structure
- [x] Initialize Next.js web app
- [x] Set up Prisma with SQLite
- [x] Install UI dependencies (Tailwind)
- [x] Create .env.example

## Phase 2: Web MVP - Core Features ✅
- [x] Data model: User, SyncPack, Rating, ViewEvent
- [x] API: Create SyncPack
- [x] API: Get SyncPack by slug
- [x] API: Submit rating
- [x] Page: Create SyncPack form (reactor)
- [x] Page: View SyncPack (viewer) with sync controls
- [x] Page: Ratings display + submit

## Phase 3: Authentication ⏳
- [ ] NextAuth.js setup with magic link
- [ ] Protect create/edit routes
- [ ] User profile page

## Phase 4: Chrome Extension MVP ✅
- [x] Vite + TypeScript scaffold
- [x] Manifest V3 setup
- [x] Content script: detect YouTube reaction pages
- [x] Side panel UI: sync controls
- [x] Background: fetch SyncPack from API
- [x] Sync logic: open official track, nudge controls

## Phase 5: Calibration & Polish ⏳
- [x] Local offset storage (viewer adjustments)
- [x] Analytics (view events)
- [ ] Advanced calibration flow UI (tap-to-sync)
- [ ] Drift correction implementation

## Phase 6: Documentation ✅
- [x] docs/00-overview.md
- [x] docs/01-local-dev.md
- [x] docs/02-extension-install.md
- [x] docs/03-data-model.md
- [x] docs/04-api.md

---

## Future Enhancements

### High Priority
- [ ] User authentication (magic links)
- [ ] Protected routes for creating packs
- [ ] Edit/delete Sync Packs
- [ ] Advanced calibration with tap-to-sync

### Medium Priority
- [ ] Publish extension to Chrome Web Store
- [ ] Deploy web app to Vercel
- [ ] PostgreSQL for production
- [ ] Social sharing features

### Low Priority
- [ ] Multiple sync points per pack
- [ ] Auto-detect offset (audio fingerprinting)
- [ ] Mobile support
- [ ] YouTube Music integration

---
Last updated: MVP Complete!
