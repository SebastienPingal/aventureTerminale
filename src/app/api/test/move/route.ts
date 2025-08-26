import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { fetchWorldCell, createWorldCell } from '@/actions/worldCell'
import { updateUser } from '@/actions/user'
import { publishPresenceEventKafka } from '@/lib/events/presenceKafka'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

type MoveBody = {
  userId: string
  direction: 'north' | 'south' | 'east' | 'west'
}

export async function POST(req: NextRequest) {
  try {
    const { userId, direction } = (await req.json()) as MoveBody
    if (!userId || !direction) {
      return new Response(JSON.stringify({ success: false, error: 'missing_params' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { worldCell: true }
    })

    if (!user || !user.worldCell) {
      return new Response(JSON.stringify({ success: false, error: 'user_not_ready' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
      })
    }

    let newX = user.worldCell.x
    let newY = user.worldCell.y
    if (direction === 'north') newY++
    if (direction === 'south') newY--
    if (direction === 'east') newX++
    if (direction === 'west') newX--

    let targetCell = await fetchWorldCell(newX, newY)
    if (!targetCell) {
      targetCell = await createWorldCell(newX, newY, '.', 'Unknown', 'A mysterious place')
    }

    const previousCell = user.worldCell

    await updateUser({ id: user.id } as Prisma.UserWhereUniqueInput, {
      worldCell: { connect: { x_y: { x: newX, y: newY } } }
    })

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

    return new Response(JSON.stringify({ success: true, newCell: targetCell, previousCell }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (err) {
    console.error('🧪 failed to move user', err)
    return new Response(JSON.stringify({ success: false, error: 'failed_to_move' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
}


