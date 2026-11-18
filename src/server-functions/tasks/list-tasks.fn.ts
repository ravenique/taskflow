import { createServerFn } from "@tanstack/react-start";
import { listTasksUseCase } from "#/server/composition/tasks.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { ListTasksResultDto } from "#/shared/schemas/task.schema";
import { listTasksInputSchema } from "#/shared/schemas/task.schema";

export const listTasksFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(listTasksInputSchema)
	.handler(async ({ context, data }): Promise<ListTasksResultDto> => {
		return listTasksUseCase.execute({
			actorUserId: context.authSession.user.id,
			actorSystemPermissions: context.authSession.user.systemPermissions,
			payload: data,
		});
	});
