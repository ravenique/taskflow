import { createServerFn } from "@tanstack/react-start";
import { createTaskUseCase } from "#/server/composition/tasks.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { TaskDto } from "#/shared/schemas/task.schema";
import { createTaskInputSchema } from "#/shared/schemas/task.schema";

export const createTaskFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(createTaskInputSchema)
	.handler(async ({ context, data }): Promise<TaskDto> => {
		return createTaskUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
