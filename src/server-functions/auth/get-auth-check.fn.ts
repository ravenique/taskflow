import { createServerFn } from "@tanstack/react-start";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import type { AuthCheckResultDto } from "#/shared/schemas/auth.schema";

export const getAuthCheckFn = createServerFn({ method: "GET" })
	.middleware([requireAuthMiddleware])
	.handler(async ({ context }): Promise<AuthCheckResultDto> => {
		const { user } = context.authSession;

		return {
			authenticated: true,
			userId: user.id,
			email: user.email,
			systemRoles: user.systemRoles,
			systemPermissions: user.systemPermissions,
		};
	});
