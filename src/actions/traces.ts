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

export async function cleanupExpiredTraces(): Promise<number> {
  const result = await prisma.userTrace.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  })

  console.log(`🧹 Cleaned up ${result.count} expired traces`)
  return result.count
}

// Decay trace intensity over time
export async function updateTraceIntensity(): Promise<void> {
  const traces = await prisma.userTrace.findMany({
    where: { expiresAt: { gt: new Date() } }
  })

  for (const trace of traces) {
    const ageHours = (Date.now() - trace.createdAt.getTime()) / (1000 * 60 * 60)
    const maxHours = (trace.expiresAt.getTime() - trace.createdAt.getTime()) / (1000 * 60 * 60)
    const newIntensity = Math.max(10, 100 - Math.floor((ageHours / maxHours) * 90))

    if (newIntensity !== trace.intensity) {
      await prisma.userTrace.update({
        where: { id: trace.id },
        data: { intensity: newIntensity }
      })
    }
  }
}