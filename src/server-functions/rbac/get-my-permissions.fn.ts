import { createServerFn } from "@tanstack/react-start";
import { getMyPermissionsUseCase } from "#/server/composition/rbac.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { MyPermissionsDto } from "#/shared/schemas/rbac.schema";

export const getMyPermissionsFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.handler(async ({ context }): Promise<MyPermissionsDto> => {
		return getMyPermissionsUseCase.execute({
			userId: context.authSession.user.id,
		});
	});
