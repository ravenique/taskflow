import { createServerFn } from "@tanstack/react-start";
import { getTaskDetailUseCase } from "#/server/composition/tasks.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { TaskDetailDto } from "#/shared/schemas/task.schema";
import { getTaskDetailInputSchema } from "#/shared/schemas/task.schema";

export const getTaskDetailFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(getTaskDetailInputSchema)
	.handler(async ({ context, data }): Promise<TaskDetailDto> => {
		return getTaskDetailUseCase.execute({
			actorUserId: context.authSession.user.id,
			actorSystemPermissions: context.authSession.user.systemPermissions,
			payload: data,
		});
	});
