import mariadb from "mariadb";

export async function GET() {
  let pool: ReturnType<typeof mariadb.createPool> | undefined;
  let connection: Awaited<
    ReturnType<ReturnType<typeof mariadb.createPool>["getConnection"]>
  > | undefined;

  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not defined");
    }

    const url = new URL(databaseUrl);

    const config = {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\/+/, ""),

      connectionLimit: 1,
      connectTimeout: 15000,
      acquireTimeout: 15000,
    };

    console.log("=== DIRECT MARIADB TEST ===");
    console.log({
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
    });

    pool = mariadb.createPool(config);

    console.log("Getting connection...");

    connection = await pool.getConnection();

    console.log("CONNECTED TO MARIADB!");

    const result = await connection.query(
      "SELECT 1 AS ok, VERSION() AS version"
    );

    console.log("QUERY RESULT:", result);

    return Response.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("=== DIRECT MARIADB ERROR ===");
    console.error(error);

    const err = error as {
      message?: string;
      code?: string;
      errno?: number;
      sqlState?: string;
      sqlMessage?: string;
      cause?: unknown;
    };

    return Response.json(
      {
        success: false,
        error: err.message ?? String(error),
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage,
        cause: err.cause ? String(err.cause) : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }

    if (pool) {
      await pool.end().catch(() => {});
    }
  }
}