import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/ratings - Submit a rating
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      syncPackId,
      reactionRating,
      trackRating,
      comment,
      viewerFingerprint,
    } = body

    // Validate required fields
    if (!syncPackId || !reactionRating || !trackRating || !viewerFingerprint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (reactionRating < 1 || reactionRating > 5 || trackRating < 1 || trackRating > 5) {
      return NextResponse.json(
        { error: 'Ratings must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if sync pack exists
    const syncPack = await prisma.syncPack.findUnique({
      where: { id: syncPackId },
    })

    if (!syncPack) {
      return NextResponse.json(
        { error: 'Sync pack not found' },
        { status: 404 }
      )
    }

    // Upsert rating (update if exists, create if not)
    const rating = await prisma.rating.upsert({
      where: {
        syncPackId_viewerFingerprint: {
          syncPackId,
          viewerFingerprint,
        },
      },
      update: {
        reactionRating,
        trackRating,
        comment: comment || null,
      },
      create: {
        syncPackId,
        reactionRating,
        trackRating,
        comment: comment || null,
        viewerFingerprint,
      },
    })

    return NextResponse.json(rating, { status: 201 })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}

// GET /api/ratings?syncPackId=xxx - Get ratings for a sync pack
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const syncPackId = searchParams.get('syncPackId')

    if (!syncPackId) {
      return NextResponse.json(
        { error: 'syncPackId is required' },
        { status: 400 }
      )
    }

    const ratings = await prisma.rating.findMany({
      where: { syncPackId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reactionRating: true,
        trackRating: true,
        comment: true,
        createdAt: true,
      },
    })

    // Calculate stats
    const stats = {
      count: ratings.length,
      avgReactionRating: ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.reactionRating, 0) / ratings.length
        : 0,
      avgTrackRating: ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.trackRating, 0) / ratings.length
        : 0,
    }

    return NextResponse.json({ ratings, stats })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}
