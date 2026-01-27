import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import SyncPlayer from './sync-player'
import ShareBox from './share-box'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ created?: string }>
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { created } = await searchParams

  const pack = await prisma.syncPack.findUnique({
    where: { slug },
    include: {
      creator: { select: { name: true } },
      ratings: {
        select: { reactionRating: true, trackRating: true },
      },
    },
  })

  if (!pack) {
    notFound()
  }

  // Record view event
  await prisma.viewEvent.create({
    data: {
      syncPackId: pack.id,
      eventType: 'view',
    },
  })

  // Calculate average ratings
  const avgReactionRating = pack.ratings.length > 0
    ? pack.ratings.reduce((sum, r) => sum + r.reactionRating, 0) / pack.ratings.length
    : 0
  const avgTrackRating = pack.ratings.length > 0
    ? pack.ratings.reduce((sum, r) => sum + r.trackRating, 0) / pack.ratings.length
    : 0

  return (
    <div className="space-y-8">
      {created === 'true' && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          Sync Pack created! Share this URL with your viewers.
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">{pack.reactionTitle || 'Reaction Video'}</h1>
        <p className="text-[var(--muted-foreground)]">
          Synced to: {pack.officialTitle || 'Official Track'}
        </p>
        {pack.creator?.name && (
          <p className="text-sm text-[var(--muted-foreground)]">
            by {pack.creator.name}
          </p>
        )}
      </div>

      {/* Ratings Summary */}
      {pack.ratings.length > 0 && (
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-[var(--muted-foreground)]">Reaction:</span>{' '}
            <span className="font-medium">{avgReactionRating.toFixed(1)}/5</span>
            <span className="text-[var(--muted-foreground)]"> ({pack.ratings.length})</span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Track:</span>{' '}
            <span className="font-medium">{avgTrackRating.toFixed(1)}/5</span>
          </div>
        </div>
      )}

      {/* Main Sync Player */}
      <SyncPlayer
        syncPackId={pack.id}
        reactionUrl={pack.reactionYoutubeUrl}
        officialUrl={pack.officialYoutubeUrl}
        baseOffsetMs={pack.baseOffsetMs}
        notes={pack.notes}
      />

      {/* Share Section */}
      <ShareBox slug={pack.slug} />
    </div>
  )
}
