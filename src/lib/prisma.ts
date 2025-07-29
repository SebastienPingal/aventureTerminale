import { PrismaClient } from '../app/generated/prisma'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const createPrismaClient = () => {
    if (typeof window !== 'undefined') {
        throw new Error('PrismaClient should not be used in the browser')
    }
    
    const client = new PrismaClient()
    
    // Only use Accelerate if explicitly configured for it
    if (process.env.DATABASE_URL?.startsWith('prisma://') || 
        process.env.DATABASE_URL?.startsWith('prisma+postgres://')) {
        return client.$extends(withAccelerate())
    }
    
    // For regular PostgreSQL connections
    return client
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
