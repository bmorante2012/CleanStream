import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function HomePage() {
  // Fetch recent published sync packs
  const recentPacks = await prisma.syncPack.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { ratings: true, viewEvents: true } },
    },
  })

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">
          Watch Reactions Without Copyright Worry
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-8">
          CleanStream syncs reaction videos with official music sources.
          Viewers hear the licensed track, reactors stay compliant.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/create"
            className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create a Sync Pack
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="p-6 rounded-lg bg-[var(--secondary)]">
          <div className="text-2xl mb-3">1</div>
          <h3 className="font-semibold mb-2">Reactor Creates Sync Pack</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Link your reaction video to the official track and set the sync offset.
          </p>
        </div>
        <div className="p-6 rounded-lg bg-[var(--secondary)]">
          <div className="text-2xl mb-3">2</div>
          <h3 className="font-semibold mb-2">Viewer Opens Both Videos</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            CleanStream guides the viewer to open both videos and sync them together.
          </p>
        </div>
        <div className="p-6 rounded-lg bg-[var(--secondary)]">
          <div className="text-2xl mb-3">3</div>
          <h3 className="font-semibold mb-2">Enjoy in Perfect Sync</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            The reaction video is muted while the official track plays. Everyone wins.
          </p>
        </div>
      </section>

      {/* Recent Sync Packs */}
      {recentPacks.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Recent Sync Packs</h2>
          <div className="grid gap-4">
            {recentPacks.map((pack) => (
              <Link
                key={pack.id}
                href={`/watch/${pack.slug}`}
                className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{pack.reactionTitle || 'Untitled Reaction'}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Synced to: {pack.officialTitle || 'Official Track'}
                    </p>
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    {pack._count.viewEvents} views
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {recentPacks.length === 0 && (
        <section className="text-center py-12 text-[var(--muted-foreground)]">
          <p>No sync packs yet. Be the first to create one!</p>
        </section>
      )}
    </div>
  )
}
