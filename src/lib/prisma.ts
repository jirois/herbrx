import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// 1. Extract the exact return type dynamically from the creation function
type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

// 2. Cast globalThis using the inferred dynamic type instead of the rigid base PrismaClient
const globalForPrisma = globalThis as unknown as { prisma: ExtendedPrismaClient }

const createPrismaClient = () => {
  const url = new URL(process.env.DATABASE_URL!)
  
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectionLimit: 5, // Kept small to respect Hostinger shared hosting limits
  })
  
  // TypeScript tracks that this specific instance utilizes a Driver Adapter
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma