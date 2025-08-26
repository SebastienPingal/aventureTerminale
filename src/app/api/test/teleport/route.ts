import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { fetchWorldCell, createWorldCell } from '@/actions/worldCell'
import { updateUser } from '@/actions/user'
import { publishPresenceEventKafka } from '@/lib/events/presenceKafka'

export const runtime = 'nodejs'

type TeleportBody = {
  userId: string
  x?: number
  y?: number
  worldCellId?: string
  mapCharacter?: string
  title?: string
  description?: string
}

export async function POST(req: NextRequest) {
  try {
    const { userId, x, y, worldCellId, mapCharacter, title, description } = (await req.json()) as TeleportBody

    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'missing_userId' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { worldCell: true }
    })

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'user_not_found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
      })
    }

    let targetCell = null as Awaited<ReturnType<typeof fetchWorldCell>> | null
    if (worldCellId) {
      targetCell = await prisma.worldCell.findUnique({ where: { id: worldCellId } }) as any
      if (!targetCell) {
        return new Response(JSON.stringify({ success: false, error: 'world_cell_not_found' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        })
      }
    } else {
      if (typeof x !== 'number' || typeof y !== 'number') {
        return new Response(JSON.stringify({ success: false, error: 'missing_coordinates' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        })
      }
      targetCell = await fetchWorldCell(x, y)
      if (!targetCell) {
        targetCell = await createWorldCell(
          x,
          y,
          mapCharacter || '.',
          title || 'Unknown',
          description || 'A mysterious place'
        )
      }
    }

    const previousCell = user.worldCell || null

    if (worldCellId) {
      await updateUser({ id: user.id }, { worldCell: { connect: { id: worldCellId } } })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await updateUser({ id: user.id }, { worldCell: { connect: { x_y: { x: x!, y: y! } } } })
    }

    if (previousCell) {
      await publishPresenceEventKafka({
        type: 'user_left',
        worldCellId: previousCell.id,
        userId: user.id,
        at: new Date().toISOString()
      })
    }

    await publishPresenceEventKafka({
      type: 'user_entered',
      worldCellId: targetCell.id,
      userId: user.id,
      at: new Date().toISOString()
    })

    console.log('🧪 teleported user', { userId: user.id, to: { x, y } })

    return new Response(
      JSON.stringify({ success: true, userId: user.id, cell: targetCell, from: previousCell }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (err) {
    console.error('🧪 failed to teleport user', err)
    return new Response(JSON.stringify({ success: false, error: 'failed_to_teleport' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
}


