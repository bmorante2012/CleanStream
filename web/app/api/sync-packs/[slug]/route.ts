import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface Params {
  params: Promise<{ slug: string }>
}

// GET /api/sync-packs/[slug] - Get a sync pack by slug
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params

    const syncPack = await prisma.syncPack.findUnique({
      where: { slug },
      include: {
        creator: {
          select: { name: true },
        },
        ratings: {
          select: {
            reactionRating: true,
            trackRating: true,
          },
        },
        _count: {
          select: { viewEvents: true },
        },
      },
    })

    if (!syncPack) {
      return NextResponse.json(
        { error: 'Sync pack not found' },
        { status: 404 }
      )
    }

    // Calculate averages
    const avgReactionRating = syncPack.ratings.length > 0
      ? syncPack.ratings.reduce((sum, r) => sum + r.reactionRating, 0) / syncPack.ratings.length
      : 0
    const avgTrackRating = syncPack.ratings.length > 0
      ? syncPack.ratings.reduce((sum, r) => sum + r.trackRating, 0) / syncPack.ratings.length
      : 0

    return NextResponse.json({
      ...syncPack,
      avgReactionRating,
      avgTrackRating,
      ratingCount: syncPack.ratings.length,
      viewCount: syncPack._count.viewEvents,
    })
  } catch (error) {
    console.error('Error fetching sync pack:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync pack' },
      { status: 500 }
    )
  }
}

// PATCH /api/sync-packs/[slug] - Update a sync pack
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const body = await request.json()

    const {
      reactionTitle,
      officialTitle,
      baseOffsetMs,
      driftCorrectionMs,
      segments,
      notes,
      isPublished,
    } = body

    const syncPack = await prisma.syncPack.update({
      where: { slug },
      data: {
        ...(reactionTitle !== undefined && { reactionTitle }),
        ...(officialTitle !== undefined && { officialTitle }),
        ...(baseOffsetMs !== undefined && { baseOffsetMs }),
        ...(driftCorrectionMs !== undefined && { driftCorrectionMs }),
        ...(segments !== undefined && { segments: JSON.stringify(segments) }),
        ...(notes !== undefined && { notes }),
        ...(isPublished !== undefined && { isPublished }),
        version: { increment: 1 },
      },
    })

    return NextResponse.json(syncPack)
  } catch (error) {
    console.error('Error updating sync pack:', error)
    return NextResponse.json(
      { error: 'Failed to update sync pack' },
      { status: 500 }
    )
  }
}
