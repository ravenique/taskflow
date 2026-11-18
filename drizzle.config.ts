import { defineConfig } from "drizzle-kit";
import { env } from "./src/server/config/env";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/server/infrastructure/drizzle/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
