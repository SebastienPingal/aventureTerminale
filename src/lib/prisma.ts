import { PrismaClient } from '../app/generated/prisma'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const createPrismaClient = () => {
    if (typeof window !== 'undefined') {
        throw new Error('PrismaClient should not be used in the browser')
    }
    
    // Use Accelerate only if the URL is configured for it
    const client = new PrismaClient()
    
    if (process.env.DATABASE_URL?.startsWith('prisma://')) {
        return client.$extends(withAccelerate())
    }
    
    return client
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
