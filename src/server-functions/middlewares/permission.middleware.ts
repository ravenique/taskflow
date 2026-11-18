import { createMiddleware } from "@tanstack/react-start";
import { authorizationService } from "#/server/composition/rbac.container";
import type { SystemPermissionCode } from "#/shared/schemas/rbac.schema";
import { requireAuthMiddleware } from "./auth.middleware";
import { domainErrorMiddleware } from "./domain-error.middleware";

export function requireSystemPermission(
	requiredPermission: SystemPermissionCode,
) {
	return createMiddleware({ type: "function" })
		.middleware([domainErrorMiddleware, requireAuthMiddleware])
		.server(async ({ context, next }) => {
			authorizationService.assertSystemPermission(
				context.authSession.user.systemPermissions,
				requiredPermission,
			);

			return next({
				context: {
					authSession: context.authSession,
				},
			});
		});
}
