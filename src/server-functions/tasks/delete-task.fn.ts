import { createServerFn } from "@tanstack/react-start";
import { deleteTaskUseCase } from "#/server/composition/tasks.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import { deleteTaskInputSchema } from "#/shared/schemas/task.schema";

export const deleteTaskFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(deleteTaskInputSchema)
	.handler(async ({ context, data }): Promise<{ deleted: true }> => {
		return deleteTaskUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
