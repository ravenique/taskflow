import { z } from "zod";

const serverEnvSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	DATABASE_URL: z
		.string()
		.min(1, "DATABASE_URL is required")
		.refine(
			(value) =>
				value.startsWith("postgres://") || value.startsWith("postgresql://"),
			"DATABASE_URL must start with postgres:// or postgresql://",
		),
	BETTER_AUTH_SECRET: z
		.string()
		.min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
	BETTER_AUTH_URL: z
		.url("BETTER_AUTH_URL must be a valid URL")
		.default("http://localhost:3000"),
});

function parseServerEnv() {
	const result = serverEnvSchema.safeParse(process.env);

	if (!result.success) {
		const flattened = z.flattenError(result.error);
		console.error(
			"Invalid server environment variables:",
			flattened.fieldErrors,
		);
		throw new Error(
			"Invalid server environment variables. Check your .env file.",
		);
	}

	return result.data;
}

export const env = parseServerEnv();
export type ServerEnv = typeof env;
