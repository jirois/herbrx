import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL || 'mysql://127.0.0.1:3306/u309736608_herbrx'
  const url = new URL(databaseUrl)

  const poolConfig: mariadb.PoolConfig = {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectionLimit: 5,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    idleTimeout: 30000,
    minimumIdle: 0,
  }

  // Pass poolConfig directly into PrismaMariaDb
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