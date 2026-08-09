import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL || 'mysql://localhost:3306/placeholder'
  const url = new URL(databaseUrl)

  const poolConfig: mariadb.PoolConfig = {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectionLimit: 3, // Safe limit for Hostinger shared/remote limits
    connectTimeout: 30000,
    socketTimeout: 30000,
    acquireTimeout: 30000,
  }

  const adapter = new PrismaMariaDb(poolConfig)
  return new PrismaClient({ adapter })
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}