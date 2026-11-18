import { createServerFn } from "@tanstack/react-start";
import { listProjectActivityUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { ActivityLogDto } from "#/shared/schemas/project.schema";
import { listProjectActivityInputSchema } from "#/shared/schemas/project.schema";

export const listProjectActivityFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(listProjectActivityInputSchema)
	.handler(async ({ context, data }): Promise<ActivityLogDto[]> => {
		return listProjectActivityUseCase.execute({
			actorUserId: context.authSession.user.id,
			actorSystemPermissions: context.authSession.user.systemPermissions,
			payload: data,
		});
	});
