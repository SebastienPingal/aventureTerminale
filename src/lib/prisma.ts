import { PrismaClient } from '../app/generated/prisma'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

// Use edge-compatible client for middleware
const createPrismaClient = () => {
    if (typeof window !== 'undefined') {
        throw new Error('PrismaClient should not be used in the browser')
    }
    
    return new PrismaClient().$extends(withAccelerate())
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
