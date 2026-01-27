# API Documentation

## Base URL

- **Development**: `http://localhost:3000/api` (or port 3001)
- **Production**: `https://your-domain.com/api`

## Authentication

Currently, the API is open for MVP. Future versions will require authentication for creating/editing Sync Packs.

---

## Sync Packs

### List Sync Packs

```
GET /api/sync-packs
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Max results (default: 20, max: 100) |
| offset | number | Skip results (default: 0) |

**Response:**
```json
[
  {
    "id": "clm...",
    "slug": "B5CWBuuoHd",
    "reactionTitle": "My Reaction to...",
    "officialTitle": "Artist - Song",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "_count": {
      "ratings": 5,
      "viewEvents": 42
    }
  }
]
```

---

### Get Sync Pack

```
GET /api/sync-packs/:slug
```

**Response:**
```json
{
  "id": "clm...",
  "slug": "B5CWBuuoHd",
  "reactionYoutubeUrl": "https://youtube.com/watch?v=abc123",
  "reactionTitle": "My Reaction to Amazing Song",
  "officialYoutubeUrl": "https://youtube.com/watch?v=xyz789",
  "officialTitle": "Artist - Amazing Song",
  "baseOffsetMs": 500,
  "driftCorrectionMs": 0,
  "segments": null,
  "notes": "Skip to 0:30 for the drop",
  "version": 1,
  "isPublished": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "creator": {
    "name": "ReactorName"
  },
  "avgReactionRating": 4.5,
  "avgTrackRating": 4.8,
  "ratingCount": 5,
  "viewCount": 42
}
```

**Error Responses:**
- `404`: Sync pack not found

---

### Create Sync Pack

```
POST /api/sync-packs
```

**Request Body:**
```json
{
  "reactionYoutubeUrl": "https://youtube.com/watch?v=abc123",
  "reactionTitle": "My Reaction",
  "officialYoutubeUrl": "https://youtube.com/watch?v=xyz789",
  "officialTitle": "Artist - Song",
  "baseOffsetMs": 500,
  "notes": "Optional notes"
}
```

**Required Fields:**
- `reactionYoutubeUrl`
- `officialYoutubeUrl`

**Response:** (201 Created)
```json
{
  "id": "clm...",
  "slug": "B5CWBuuoHd",
  "reactionYoutubeUrl": "https://youtube.com/watch?v=abc123",
  ...
}
```

**Error Responses:**
- `400`: Missing required fields

---

### Update Sync Pack

```
PATCH /api/sync-packs/:slug
```

**Request Body:** (all fields optional)
```json
{
  "reactionTitle": "Updated Title",
  "officialTitle": "Updated Track Title",
  "baseOffsetMs": 750,
  "driftCorrectionMs": 5,
  "segments": [{"start": 0, "end": 30000}],
  "notes": "Updated notes",
  "isPublished": true
}
```

**Response:**
```json
{
  "id": "clm...",
  "slug": "B5CWBuuoHd",
  "version": 2,
  ...
}
```

---

## Ratings

### Submit Rating

```
POST /api/ratings
```

**Request Body:**
```json
{
  "syncPackId": "clm...",
  "reactionRating": 4,
  "trackRating": 5,
  "comment": "Great reaction!",
  "viewerFingerprint": "v_abc123xyz"
}
```

**Required Fields:**
- `syncPackId`
- `reactionRating` (1-5)
- `trackRating` (1-5)
- `viewerFingerprint`

**Response:** (201 Created)
```json
{
  "id": "clm...",
  "reactionRating": 4,
  "trackRating": 5,
  "comment": "Great reaction!",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Notes:**
- If the same fingerprint submits again, it updates the existing rating (upsert)
- `viewerFingerprint` should be generated client-side and stored in localStorage

**Error Responses:**
- `400`: Missing required fields or invalid rating values
- `404`: Sync pack not found

---

### Get Ratings

```
GET /api/ratings?syncPackId=clm...
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| syncPackId | string | Required - The sync pack ID |

**Response:**
```json
{
  "ratings": [
    {
      "id": "clm...",
      "reactionRating": 4,
      "trackRating": 5,
      "comment": "Great reaction!",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "stats": {
    "count": 5,
    "avgReactionRating": 4.2,
    "avgTrackRating": 4.6
  }
}
```

---

## Events

### Record Event

```
POST /api/sync-packs/:slug/events
```

**Request Body:**
```json
{
  "eventType": "sync_start",
  "metadata": {
    "offset": 500,
    "browserInfo": "Chrome 120"
  }
}
```

**Event Types:**
- `view` - Page loaded
- `sync_start` - User started syncing
- `sync_complete` - User completed sync

**Response:** (201 Created)
```json
{
  "success": true,
  "eventId": "clm..."
}
```

---

## Error Format

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

Common HTTP status codes:
- `400` - Bad request (missing/invalid parameters)
- `404` - Resource not found
- `500` - Server error

---

## Rate Limiting

Currently no rate limiting for MVP. Production will implement:
- 100 requests per minute for reads
- 10 requests per minute for writes

---

## CORS

The API allows requests from:
- `http://localhost:*` (development)
- Chrome extension origins
- Your production domain
