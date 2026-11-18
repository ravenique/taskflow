import { createServerFn } from "@tanstack/react-start";
import { assignTaskUseCase } from "#/server/composition/tasks.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { TaskDto } from "#/shared/schemas/task.schema";
import { assignTaskInputSchema } from "#/shared/schemas/task.schema";

export const assignTaskFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(assignTaskInputSchema)
	.handler(async ({ context, data }): Promise<TaskDto> => {
		return assignTaskUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
