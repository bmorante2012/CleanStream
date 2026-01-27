'use client'

import { useState } from 'react'
import { generateViewerFingerprint } from '@/lib/utils'

interface RatingFormProps {
  syncPackId: string
  onSubmitted: () => void
}

export default function RatingForm({ syncPackId, onSubmitted }: RatingFormProps) {
  const [reactionRating, setReactionRating] = useState(0)
  const [trackRating, setTrackRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (reactionRating === 0 || trackRating === 0) {
      setError('Please rate both the reaction and the track')
      return
    }

    setIsSubmitting(true)

    try {
      const fingerprint = generateViewerFingerprint()

      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncPackId,
          reactionRating,
          trackRating,
          comment: comment.trim() || null,
          viewerFingerprint: fingerprint,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit rating')
      }

      setSuccess(true)
      setTimeout(onSubmitted, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
        Thanks for your rating!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Reaction Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rate the Reaction
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setReactionRating(rating)}
              className={`w-10 h-10 rounded-lg border text-lg transition-colors ${
                reactionRating >= rating
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                  : 'border-[var(--border)] hover:bg-[var(--secondary)]'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      {/* Track Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rate the Track
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setTrackRating(rating)}
              className={`w-10 h-10 rounded-lg border text-lg transition-colors ${
                trackRating >= rating
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                  : 'border-[var(--border)] hover:bg-[var(--secondary)]'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Comment (optional)
        </label>
        <textarea
          id="comment"
          rows={2}
          maxLength={500}
          placeholder="Any feedback about the sync or experience?"
          className="w-full px-3 py-2 border border-[var(--input)] rounded-lg bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </form>
  )
}
