"use server"

import prisma from "@/lib/prisma"
import { UserTrace, UserTraceType } from "@/lib/types"

export async function createUserTrace(
  userId: string,
  worldCellId: string,
  traceType: UserTraceType = 'FOOTPRINT',
  description?: string,
  durationHours: number = 24
): Promise<UserTrace> {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + durationHours)

  return await prisma.userTrace.create({
    data: {
      userId,
      worldCellId,
      traceType,
      description,
      expiresAt,
      intensity: 100
    },
    include: {
      user: { select: { name: true, email: true } },
      worldCell: true
    }
  })
}

export async function fetchActiveTracesInCell(
  worldCellId: string,
  excludeUserId?: string
): Promise<UserTrace[]> {
  return await prisma.userTrace.findMany({
    where: {
      worldCellId,
      expiresAt: { gt: new Date() },
      userId: excludeUserId ? { not: excludeUserId } : undefined
    },
    include: {
      user: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

// Decay trace intensity over time
export async function updateTraceIntensity(): Promise<void> {
  const traces = await prisma.userTrace.findMany()

  for (const trace of traces) {
    const newIntensity = trace.intensity - trace.volatility

    if (newIntensity < 0) {
      await prisma.userTrace.delete({
        where: { id: trace.id }
      })

    } else {
      await prisma.userTrace.update({
        where: { id: trace.id },
        data: { intensity: newIntensity }
      })
    }

  }
}