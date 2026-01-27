import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface Params {
  params: Promise<{ slug: string }>
}

// POST /api/sync-packs/[slug]/events - Record a view event
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { eventType, metadata } = body

    // Find the sync pack
    const syncPack = await prisma.syncPack.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!syncPack) {
      return NextResponse.json(
        { error: 'Sync pack not found' },
        { status: 404 }
      )
    }

    // Create the event
    const event = await prisma.viewEvent.create({
      data: {
        syncPackId: syncPack.id,
        eventType: eventType || 'view',
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return NextResponse.json({ success: true, eventId: event.id }, { status: 201 })
  } catch (error) {
    console.error('Error recording event:', error)
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500 }
    )
  }
}
