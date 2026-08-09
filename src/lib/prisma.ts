import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL || ''

  let user = 'u309736608_herbrx_db'
  let password = 'UyouyoumeAkpos@2025'
  let database = 'u309736608_herbrx'

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl)
      user = url.username || user
      password = url.password ? decodeURIComponent(url.password) : password
      database = url.pathname.replace(/^\//, '') || database
    } catch (e) {
      console.error('[Prisma] Error parsing DATABASE_URL:', e)
    }
  }

  const poolConfig: mariadb.PoolConfig = {
    // 🚀 Bypasses TCP completely and connects directly via Hostinger's local socket
    socketPath: '/var/lib/mysql/mysql.sock', 
    user,
    password,
    database,
    connectionLimit: 5,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    idleTimeout: 30000,
    minimumIdle: 0,
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