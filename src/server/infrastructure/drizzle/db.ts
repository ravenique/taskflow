import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "#/server/config/env";
import { dbSchema } from "#/server/infrastructure/drizzle/schema";

declare global {
	var __taskflowPgPool: Pool | undefined;
}

export const pool =
	globalThis.__taskflowPgPool ??
	new Pool({
		connectionString: env.DATABASE_URL,
	});

if (env.NODE_ENV !== "production") {
	globalThis.__taskflowPgPool = pool;
}

export const db = drizzle(pool, { schema: dbSchema });

export type AppDb = typeof db;
export type AppTx = Parameters<Parameters<AppDb["transaction"]>[0]>[0];
