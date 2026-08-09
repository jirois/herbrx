import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL || ''

  let host = '127.0.0.1'
  let user = 'u309736608_herbrx_db'
  let password = 'UyouyoumeAkpos@2025'
  let database = 'u309736608_herbrx'
  let port = 3306

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl)
      // Force 127.0.0.1 for local connections
      host = url.hostname === 'localhost' || url.hostname === '' ? '127.0.0.1' : url.hostname
      port = Number(url.port) || 3306
      user = url.username || user
      password = url.password ? decodeURIComponent(url.password) : password
      database = url.pathname.replace(/^\//, '') || database
    } catch (e) {
      console.error('[Prisma] Error parsing DATABASE_URL:', e)
    }
  }

  const poolConfig: mariadb.PoolConfig & { family?: number } = {
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 5,
    connectTimeout: 15000,
    acquireTimeout: 15000,
    idleTimeout: 30000,
    minimumIdle: 0,
    // CRITICAL FOR HOSTINGER NODE RUNTIME:
    family: 4,                  // Force IPv4 (prevents hung IPv6 ::1 resolution)
    ssl: false,                 // Local hostinger connections don't use SSL
    allowPublicKeyRetrieval: true,
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