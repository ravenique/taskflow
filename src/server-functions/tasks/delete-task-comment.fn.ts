import { createServerFn } from "@tanstack/react-start";
import { deleteTaskCommentUseCase } from "#/server/composition/tasks.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import { deleteTaskCommentInputSchema } from "#/shared/schemas/task.schema";

export const deleteTaskCommentFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(deleteTaskCommentInputSchema)
	.handler(async ({ context, data }): Promise<{ deleted: true }> => {
		return deleteTaskCommentUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
