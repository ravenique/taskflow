import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { eq } from "drizzle-orm";
import { env } from "#/server/config/env";
import { db } from "#/server/infrastructure/drizzle/db";
import {
	account,
	roles,
	session,
	user,
	userRoles,
	verification,
} from "#/server/infrastructure/drizzle/schema";

const DEFAULT_SIGN_UP_SYSTEM_ROLE_SLUG = "standard_member";

export const auth = betterAuth({
	appName: "TaskFlow",
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user,
			session,
			account,
			verification,
		},
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		requireEmailVerification: false,
	},
	databaseHooks: {
		user: {
			create: {
				after: async (createdUser) => {
					const [defaultRole] = await db
						.select({ id: roles.id })
						.from(roles)
						.where(eq(roles.slug, DEFAULT_SIGN_UP_SYSTEM_ROLE_SLUG))
						.limit(1);
					if (!defaultRole) {
						throw new Error(
							`Default system role '${DEFAULT_SIGN_UP_SYSTEM_ROLE_SLUG}' not found. Run 'bun run db:seed' first.`,
						);
					}

					await db
						.insert(userRoles)
						.values({
							userId: createdUser.id,
							roleId: defaultRole.id,
						})
						.onConflictDoNothing();
				},
			},
		},
	},
	plugins: [tanstackStartCookies()],
});
