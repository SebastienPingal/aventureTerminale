import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient as AccelerateClient } from '@prisma/client/edge'

// Remove the type declaration, let TypeScript infer it
let prisma

if (process.env.NODE_ENV === 'development') {
    // Use Accelerate in development
    const globalForPrisma = globalThis as unknown as {
        prisma: unknown
    }

    prisma = globalForPrisma.prisma ?? new AccelerateClient().$extends(withAccelerate())

    if (process.env.NODE_ENV === 'development') globalForPrisma.prisma = prisma
} else {
    // Use standard client in production
    const globalForPrisma = globalThis as unknown as {
        prisma: unknown
    }

    prisma = globalForPrisma.prisma ?? new PrismaClient()

    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
}

export default prisma