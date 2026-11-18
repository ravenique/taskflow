import { createServerFn } from "@tanstack/react-start";
import { addTaskCommentUseCase } from "#/server/composition/tasks.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { TaskCommentDto } from "#/shared/schemas/task.schema";
import { addTaskCommentInputSchema } from "#/shared/schemas/task.schema";

export const addTaskCommentFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(addTaskCommentInputSchema)
	.handler(async ({ context, data }): Promise<TaskCommentDto> => {
		const actor = context.authSession.user;
		return addTaskCommentUseCase.execute({
			actor: {
				id: actor.id,
				name: actor.name,
				email: actor.email,
			},
			payload: data,
		});
	});
