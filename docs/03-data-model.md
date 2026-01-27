# Data Model

## Overview

CleanStream uses Prisma ORM with SQLite for development and PostgreSQL for production. The schema is defined in `web/prisma/schema.prisma`.

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│  SyncPack   │────<│   Rating    │
│             │     │             │     │             │
│ id          │     │ id          │     │ id          │
│ email       │     │ slug        │     │ reactionRat │
│ name        │     │ reactionUrl │     │ trackRating │
│ ...         │     │ officialUrl │     │ comment     │
└─────────────┘     │ baseOffset  │     │ fingerprint │
                    │ ...         │     └─────────────┘
                    └─────────────┘
                          │
                          │
                    ┌─────────────┐
                    │ ViewEvent   │
                    │             │
                    │ id          │
                    │ eventType   │
                    │ metadata    │
                    └─────────────┘
```

## Models

### User

Represents reactor accounts (content creators who create Sync Packs).

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key (cuid) |
| email | String | Unique email address |
| name | String? | Display name |
| image | String? | Profile image URL |
| emailVerified | DateTime? | When email was verified |
| createdAt | DateTime | Account creation time |
| updatedAt | DateTime | Last update time |

**Relations:**
- `syncPacks`: SyncPack[] - Packs created by this user
- `ratings`: Rating[] - Ratings submitted by this user (if logged in)
- `accounts`, `sessions`: NextAuth.js auth data

### SyncPack

The core entity - stores sync metadata between a reaction video and official track.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key (cuid) |
| slug | String | Unique URL-friendly identifier |
| reactionYoutubeUrl | String | YouTube URL of the reaction video |
| reactionTitle | String? | Display title for the reaction |
| officialYoutubeUrl | String | YouTube URL of official track |
| officialTitle | String? | Display title for official track |
| baseOffsetMs | Int | Base timing offset in milliseconds |
| driftCorrectionMs | Int | Drift correction per minute |
| segments | String? | JSON string of segment data |
| notes | String? | Reactor's notes for viewers |
| version | Int | Version number for updates |
| isPublished | Boolean | Whether publicly visible |
| createdAt | DateTime | Creation time |
| updatedAt | DateTime | Last update time |
| creatorId | String | Foreign key to User |

**Relations:**
- `creator`: User - The reactor who created this pack
- `ratings`: Rating[] - All ratings for this pack
- `viewEvents`: ViewEvent[] - Analytics events

**Notes:**
- `baseOffsetMs`: Positive = official starts after reaction. Negative = reaction starts after official.
- `segments`: Future use for complex sync (e.g., skipping intros)

### Rating

Viewer ratings for both the reaction quality and the original track.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key (cuid) |
| reactionRating | Int | 1-5 rating for the reaction |
| trackRating | Int | 1-5 rating for the original track |
| comment | String? | Optional feedback text |
| viewerFingerprint | String | Anonymous viewer identifier |
| createdAt | DateTime | When rating was submitted |
| syncPackId | String | Foreign key to SyncPack |
| userId | String? | Foreign key to User (if logged in) |

**Relations:**
- `syncPack`: SyncPack - The pack being rated
- `user`: User? - Optional logged-in user

**Unique Constraint:** `[syncPackId, viewerFingerprint]` - One rating per viewer per pack

### ViewEvent

Analytics tracking for sync pack views and engagement.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key (cuid) |
| syncPackId | String | Foreign key to SyncPack |
| eventType | String | Event type identifier |
| metadata | String? | JSON metadata |
| createdAt | DateTime | Event timestamp |

**Event Types:**
- `view`: Pack page was loaded
- `sync_start`: User initiated sync
- `sync_complete`: User completed sync flow

### NextAuth.js Models

These models support authentication:

- **Account**: OAuth provider connections
- **Session**: Active user sessions
- **VerificationToken**: Email verification tokens

## Indexes

The following indexes are automatically created:
- `User.email` (unique)
- `SyncPack.slug` (unique)
- `Rating.syncPackId_viewerFingerprint` (unique composite)

## Migrations

### Development (SQLite)

```bash
# Generate client
DATABASE_URL="file:./dev.db" npx prisma generate

# Push schema changes (destructive)
DATABASE_URL="file:./dev.db" npx prisma db push

# View data
DATABASE_URL="file:./dev.db" npx prisma studio
```

### Production (PostgreSQL)

```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy
```

## Example Queries

### Create a SyncPack

```typescript
const pack = await prisma.syncPack.create({
  data: {
    slug: 'abc123',
    reactionYoutubeUrl: 'https://youtube.com/watch?v=...',
    officialYoutubeUrl: 'https://youtube.com/watch?v=...',
    baseOffsetMs: 500,
    creatorId: userId,
  }
})
```

### Get SyncPack with Ratings

```typescript
const pack = await prisma.syncPack.findUnique({
  where: { slug: 'abc123' },
  include: {
    creator: { select: { name: true } },
    ratings: true,
    _count: { select: { viewEvents: true } },
  }
})
```

### Submit Rating

```typescript
const rating = await prisma.rating.upsert({
  where: {
    syncPackId_viewerFingerprint: {
      syncPackId: packId,
      viewerFingerprint: fingerprint,
    }
  },
  update: { reactionRating: 4, trackRating: 5 },
  create: {
    syncPackId: packId,
    viewerFingerprint: fingerprint,
    reactionRating: 4,
    trackRating: 5,
  }
})
```
