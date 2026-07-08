import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

let created = 0;

const createPrismaClient = () => {
   created++;

  console.log("Prisma client created:", created);
  const url = new URL(process.env.DATABASE_URL!)
  
  const poolConfig: mariadb.PoolConfig = {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectionLimit: 3, // Kept small to respect Hostinger shared hosting limits

    // THESE TWO LINES ARE CRITICAL FOR HOSTINGER SHARED/REMOTE ROUTING
    connectTimeout: 30000,       // Wait up to 10 seconds for initial socket setup
    socketTimeout: 30000,        // Allow 10 seconds for standard packet handling
    acquireTimeout: 30000,
  }
  
  // TypeScript tracks that this specific instance utilizes a Driver Adapter
  const adapter = new PrismaMariaDb(poolConfig)
  return new PrismaClient({ adapter })
}
// 1. Extract the exact return type dynamically from the creation function
type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

// 2. Cast globalThis using the inferred dynamic type instead of the rigid base PrismaClient
const globalForPrisma = globalThis as unknown as { prisma: ExtendedPrismaClient }


export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma