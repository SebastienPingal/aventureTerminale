// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'development') {
    // Use Accelerate in development
    const { PrismaClient: AccelerateClient } = require('@prisma/client/edge')
    const { withAccelerate } = require('@prisma/extension-accelerate')

    const globalForPrisma = globalThis as unknown as {
        prisma: PrismaClient | undefined
    }

    prisma = globalForPrisma.prisma ?? new AccelerateClient().$extends(withAccelerate())

    if (process.env.NODE_ENV === 'development') globalForPrisma.prisma = prisma
} else {
    // Use standard client in production
    const globalForPrisma = globalThis as unknown as {
        prisma: PrismaClient | undefined
    }

    prisma = globalForPrisma.prisma ?? new PrismaClient()

    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
}

export default prisma