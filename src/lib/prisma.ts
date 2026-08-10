import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import type { PoolConfig } from 'mariadb'

const createPrismaClient = () => {
  const databaseUrl =
    process.env.DATABASE_URL ||
    'mysql://u309736608_herbrx_db:UyouyoumeAkpos%402025@srv1910.hstgr.io:3306/u309736608_herbrx'

  const url = new URL(databaseUrl)

  const config: PoolConfig = {
    host: url.hostname || 'srv1910.hstgr.io',
    port: Number(url.port) || 3306,
    user: url.username || 'u309736608_herbrx_db',
    password: url.password ? decodeURIComponent(url.password) : 'UyouyoumeAkpos@2025',
    database: url.pathname.replace(/^\//, '') || 'u309736608_herbrx',
    connectionLimit: 5,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    idleTimeout: 30000,
    minimumIdle: 0,
    ssl: false,
    allowPublicKeyRetrieval: true,
  }

  const adapter = new PrismaMariaDb(config)
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