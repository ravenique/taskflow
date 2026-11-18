import { createServerFn } from "@tanstack/react-start";
import { listMyAssignedTasksUseCase } from "#/server/composition/workspace.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { ListMyAssignedTasksResultDto } from "#/shared/schemas/workspace.schema";
import { myTasksSearchSchema } from "#/shared/schemas/workspace.schema";

export const listMyAssignedTasksFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(myTasksSearchSchema)
	.handler(async ({ context, data }): Promise<ListMyAssignedTasksResultDto> => {
		return listMyAssignedTasksUseCase.execute({
			actorUserId: context.authSession.user.id,
			actorSystemPermissions: context.authSession.user.systemPermissions,
			params: data,
		});
	});
