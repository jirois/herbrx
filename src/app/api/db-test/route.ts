// src/app/api/db-test/route.ts

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

export async function GET() {
  let prisma: PrismaClient | undefined;

  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not defined");
    }

    const url = new URL(databaseUrl);

    const host = url.hostname;
    const port = Number(url.port || 3306);
    const user = decodeURIComponent(url.username);
    const password = decodeURIComponent(url.password);
    const database = url.pathname.replace(/^\/+/, "");

    console.log("=== DB TEST CONFIG ===");
    console.log({
      host,
      port,
      user,
      database,
    });

    const adapter = new PrismaMariaDb({
      host,
      port,
      user,
      password,
      database,

      connectionLimit: 1,
      connectTimeout: 15000,
      acquireTimeout: 15000,
      idleTimeout: 30000,
    });

    prisma = new PrismaClient({ adapter });

    console.log("Calling Prisma $connect()...");

    await prisma.$connect();

    console.log("Prisma connected.");

    const result = await prisma.$queryRaw`
      SELECT 1 AS ok
    `;

    console.log("QUERY RESULT:", result);

    return Response.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("=== HOSTINGER DATABASE TEST FAILED ===");
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        cause:
          error instanceof Error && error.cause
            ? String(error.cause)
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect().catch(() => {});
    }
  }
}