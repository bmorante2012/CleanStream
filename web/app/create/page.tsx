'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { extractYouTubeId } from '@/lib/utils'

export default function CreateSyncPackPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    reactionYoutubeUrl: '',
    reactionTitle: '',
    officialYoutubeUrl: '',
    officialTitle: '',
    baseOffsetMs: 0,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Validate YouTube URLs
    if (!extractYouTubeId(formData.reactionYoutubeUrl)) {
      setError('Please enter a valid YouTube URL for the reaction video')
      setIsSubmitting(false)
      return
    }
    if (!extractYouTubeId(formData.officialYoutubeUrl)) {
      setError('Please enter a valid YouTube URL for the official track')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/sync-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create sync pack')
      }

      const pack = await response.json()
      router.push(`/watch/${pack.slug}?created=true`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Create a Sync Pack</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Link your reaction video to the official music source. Viewers will watch your
        reaction while hearing the licensed audio.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Reaction Video */}
        <fieldset className="space-y-4 p-4 border border-[var(--border)] rounded-lg">
          <legend className="px-2 font-medium">Reaction Video</legend>

          <div>
            <label htmlFor="reactionUrl" className="block text-sm font-medium mb-1">
              YouTube URL *
            </label>
            <input
              id="reactionUrl"
              type="url"
              required
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-[var(--input)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={formData.reactionYoutubeUrl}
              onChange={(e) => setFormData({ ...formData, reactionYoutubeUrl: e.target.value })}
            />
            {formData.reactionYoutubeUrl && extractYouTubeId(formData.reactionYoutubeUrl) && (
              <p className="mt-1 text-sm text-green-600">
                Video ID: {extractYouTubeId(formData.reactionYoutubeUrl)}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="reactionTitle" className="block text-sm font-medium mb-1">
              Title (for display)
            </label>
            <input
              id="reactionTitle"
              type="text"
              placeholder="My Reaction to..."
              className="w-full px-3 py-2 border border-[var(--input)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={formData.reactionTitle}
              onChange={(e) => setFormData({ ...formData, reactionTitle: e.target.value })}
            />
          </div>
        </fieldset>

        {/* Official Track */}
        <fieldset className="space-y-4 p-4 border border-[var(--border)] rounded-lg">
          <legend className="px-2 font-medium">Official Track</legend>

          <div>
            <label htmlFor="officialUrl" className="block text-sm font-medium mb-1">
              YouTube URL *
            </label>
            <input
              id="officialUrl"
              type="url"
              required
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-[var(--input)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={formData.officialYoutubeUrl}
              onChange={(e) => setFormData({ ...formData, officialYoutubeUrl: e.target.value })}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Use the official music video, VEVO channel, or YouTube Music link.
            </p>
          </div>

          <div>
            <label htmlFor="officialTitle" className="block text-sm font-medium mb-1">
              Track Title (for display)
            </label>
            <input
              id="officialTitle"
              type="text"
              placeholder="Artist - Song Name"
              className="w-full px-3 py-2 border border-[var(--input)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={formData.officialTitle}
              onChange={(e) => setFormData({ ...formData, officialTitle: e.target.value })}
            />
          </div>
        </fieldset>

        {/* Sync Settings */}
        <fieldset className="space-y-4 p-4 border border-[var(--border)] rounded-lg">
          <legend className="px-2 font-medium">Sync Settings</legend>

          <div>
            <label htmlFor="offset" className="block text-sm font-medium mb-1">
              Base Offset (milliseconds)
            </label>
            <input
              id="offset"
              type="number"
              placeholder="0"
              className="w-full px-3 py-2 border border-[var(--input)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={formData.baseOffsetMs}
              onChange={(e) => setFormData({ ...formData, baseOffsetMs: parseInt(e.target.value) || 0 })}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Positive = official starts after reaction. Negative = reaction starts after official.
              You can fine-tune this later.
            </p>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Any notes about sync points, skips, etc."
              className="w-full px-3 py-2 border border-[var(--input)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Sync Pack'}
        </button>
      </form>
    </div>
  )
}
