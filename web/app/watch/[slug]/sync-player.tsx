'use client'

import { useState, useEffect, useCallback } from 'react'
import { extractYouTubeId, formatMs, generateViewerFingerprint } from '@/lib/utils'
import RatingForm from './rating-form'

interface SyncPlayerProps {
  syncPackId: string
  reactionUrl: string
  officialUrl: string
  baseOffsetMs: number
  notes: string | null
}

type SyncState = 'initial' | 'ready' | 'syncing' | 'playing' | 'paused'

export default function SyncPlayer({
  syncPackId,
  reactionUrl,
  officialUrl,
  baseOffsetMs,
  notes,
}: SyncPlayerProps) {
  const [syncState, setSyncState] = useState<SyncState>('initial')
  const [localOffset, setLocalOffset] = useState(0)
  const [officialOpened, setOfficialOpened] = useState(false)
  const [showRating, setShowRating] = useState(false)

  // Load user's local offset adjustment from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`cleanstream_offset_${syncPackId}`)
    if (stored) {
      setLocalOffset(parseInt(stored, 10))
    }
  }, [syncPackId])

  // Save local offset to localStorage
  const saveLocalOffset = useCallback((offset: number) => {
    setLocalOffset(offset)
    localStorage.setItem(`cleanstream_offset_${syncPackId}`, offset.toString())
  }, [syncPackId])

  const totalOffset = baseOffsetMs + localOffset

  const reactionId = extractYouTubeId(reactionUrl)
  const officialId = extractYouTubeId(officialUrl)

  const openOfficialTrack = () => {
    // Open official track in a new tab
    window.open(`https://www.youtube.com/watch?v=${officialId}`, '_blank', 'noopener')
    setOfficialOpened(true)
    setSyncState('ready')
  }

  const nudgeOffset = (amount: number) => {
    saveLocalOffset(localOffset + amount)
  }

  const resetOffset = () => {
    saveLocalOffset(0)
  }

  const startCalibration = () => {
    // Simple calibration flow - user taps when they hear/see the beat
    setSyncState('syncing')
  }

  return (
    <div className="space-y-6">
      {/* Sync Instructions */}
      <div className="p-6 bg-[var(--secondary)] rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">How to Watch in Sync</h2>

        <div className="space-y-4">
          {/* Step 1: Open Official Track */}
          <div className={`flex gap-4 items-start p-4 rounded-lg border ${officialOpened ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-[var(--border)]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${officialOpened ? 'bg-green-500 text-white' : 'bg-[var(--primary)] text-[var(--primary-foreground)]'}`}>
              {officialOpened ? '✓' : '1'}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Open the Official Track</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                This opens YouTube in a new tab. Keep it ready but paused.
              </p>
              <button
                onClick={openOfficialTrack}
                className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-medium hover:opacity-90"
              >
                {officialOpened ? 'Open Again' : 'Open Official Track'}
              </button>
            </div>
          </div>

          {/* Step 2: Play Both */}
          <div className={`flex gap-4 items-start p-4 rounded-lg border ${syncState === 'playing' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-[var(--border)]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${syncState === 'playing' ? 'bg-green-500 text-white' : 'bg-[var(--muted)]'}`}>
              2
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Start Both Videos</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                Press play on the official track, then immediately press the button below.
                Mute the reaction video in YouTube if needed.
              </p>
              <button
                onClick={() => {
                  setSyncState('playing')
                  // Record sync start event
                  fetch('/api/sync-packs/' + syncPackId + '/events', {
                    method: 'POST',
                    body: JSON.stringify({ eventType: 'sync_start' }),
                    headers: { 'Content-Type': 'application/json' },
                  })
                }}
                disabled={!officialOpened}
                className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                I Started the Official Track
              </button>
            </div>
          </div>

          {/* Step 3: Open Reaction */}
          {syncState === 'playing' && (
            <div className="flex gap-4 items-start p-4 rounded-lg border border-[var(--primary)] bg-blue-50 dark:bg-blue-900/20">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[var(--primary)] text-[var(--primary-foreground)]">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Now Open the Reaction</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  {totalOffset > 0
                    ? `Wait ${formatMs(totalOffset)} then start the reaction (or let the offset handle it).`
                    : totalOffset < 0
                      ? `Start reaction immediately, official should be ${formatMs(Math.abs(totalOffset))} ahead.`
                      : 'Start the reaction immediately - they should be in sync!'}
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${reactionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-medium hover:opacity-90"
                >
                  Open Reaction Video
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync Offset Controls */}
      <div className="p-4 border border-[var(--border)] rounded-lg">
        <h3 className="font-medium mb-3">Fine-Tune Sync</h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Current offset: <span className="font-mono font-medium">{formatMs(totalOffset)}</span>
          {localOffset !== 0 && (
            <span className="text-[var(--muted-foreground)]">
              {' '}(base: {formatMs(baseOffsetMs)}, your adjustment: {formatMs(localOffset)})
            </span>
          )}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => nudgeOffset(-200)}
            className="px-3 py-1 border border-[var(--border)] rounded text-sm hover:bg-[var(--secondary)]"
          >
            -200ms
          </button>
          <button
            onClick={() => nudgeOffset(-50)}
            className="px-3 py-1 border border-[var(--border)] rounded text-sm hover:bg-[var(--secondary)]"
          >
            -50ms
          </button>
          <button
            onClick={() => nudgeOffset(50)}
            className="px-3 py-1 border border-[var(--border)] rounded text-sm hover:bg-[var(--secondary)]"
          >
            +50ms
          </button>
          <button
            onClick={() => nudgeOffset(200)}
            className="px-3 py-1 border border-[var(--border)] rounded text-sm hover:bg-[var(--secondary)]"
          >
            +200ms
          </button>
          {localOffset !== 0 && (
            <button
              onClick={resetOffset}
              className="px-3 py-1 border border-[var(--border)] rounded text-sm text-[var(--destructive)] hover:bg-red-50"
            >
              Reset
            </button>
          )}
        </div>

        <p className="text-xs text-[var(--muted-foreground)] mt-3">
          If the official track is ahead of the reaction, use negative values.
          Your adjustments are saved locally and won&apos;t affect other viewers.
        </p>
      </div>

      {/* Reactor Notes */}
      {notes && (
        <div className="p-4 border border-[var(--border)] rounded-lg">
          <h3 className="font-medium mb-2">Reactor Notes</h3>
          <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{notes}</p>
        </div>
      )}

      {/* Rating Section */}
      <div className="p-4 border border-[var(--border)] rounded-lg">
        <h3 className="font-medium mb-2">Rate This Experience</h3>
        {!showRating ? (
          <button
            onClick={() => setShowRating(true)}
            className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--secondary)]"
          >
            Leave a Rating
          </button>
        ) : (
          <RatingForm syncPackId={syncPackId} onSubmitted={() => setShowRating(false)} />
        )}
      </div>
    </div>
  )
}
