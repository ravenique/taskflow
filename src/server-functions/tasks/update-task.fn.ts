import { createServerFn } from "@tanstack/react-start";
import { updateTaskUseCase } from "#/server/composition/tasks.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { TaskDto } from "#/shared/schemas/task.schema";
import { updateTaskInputSchema } from "#/shared/schemas/task.schema";

export const updateTaskFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(updateTaskInputSchema)
	.handler(async ({ context, data }): Promise<TaskDto> => {
		return updateTaskUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
