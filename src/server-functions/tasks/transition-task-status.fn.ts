import { createServerFn } from "@tanstack/react-start";
import { transitionTaskStatusUseCase } from "#/server/composition/tasks.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { TaskDto } from "#/shared/schemas/task.schema";
import { transitionTaskStatusInputSchema } from "#/shared/schemas/task.schema";

export const transitionTaskStatusFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(transitionTaskStatusInputSchema)
	.handler(async ({ context, data }): Promise<TaskDto> => {
		return transitionTaskStatusUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
