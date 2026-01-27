import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { nanoid } from 'nanoid'

// POST /api/sync-packs - Create a new sync pack
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      reactionYoutubeUrl,
      reactionTitle,
      officialYoutubeUrl,
      officialTitle,
      baseOffsetMs,
      notes,
    } = body

    // Validate required fields
    if (!reactionYoutubeUrl || !officialYoutubeUrl) {
      return NextResponse.json(
        { error: 'Reaction URL and official URL are required' },
        { status: 400 }
      )
    }

    // Generate a unique slug
    const slug = nanoid(10)

    // For MVP, we'll create a "system" user if none exists
    // In production, this would require authentication
    let systemUser = await prisma.user.findFirst({
      where: { email: 'system@cleanstream.local' },
    })

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@cleanstream.local',
          name: 'CleanStream User',
        },
      })
    }

    const syncPack = await prisma.syncPack.create({
      data: {
        slug,
        reactionYoutubeUrl,
        reactionTitle: reactionTitle || null,
        officialYoutubeUrl,
        officialTitle: officialTitle || null,
        baseOffsetMs: baseOffsetMs || 0,
        notes: notes || null,
        isPublished: true,
        creatorId: systemUser.id,
      },
    })

    return NextResponse.json(syncPack, { status: 201 })
  } catch (error) {
    console.error('Error creating sync pack:', error)
    return NextResponse.json(
      { error: 'Failed to create sync pack' },
      { status: 500 }
    )
  }
}

// GET /api/sync-packs - List sync packs (for browsing)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const syncPacks = await prisma.syncPack.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      skip: offset,
      select: {
        id: true,
        slug: true,
        reactionTitle: true,
        officialTitle: true,
        createdAt: true,
        _count: {
          select: { ratings: true, viewEvents: true },
        },
      },
    })

    return NextResponse.json(syncPacks)
  } catch (error) {
    console.error('Error fetching sync packs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync packs' },
      { status: 500 }
    )
  }
}
