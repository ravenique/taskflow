import { createServerFn } from "@tanstack/react-start";
import { deleteProjectUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import { projectActionInputSchema } from "#/shared/schemas/project.schema";

export const deleteProjectFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(projectActionInputSchema)
	.handler(async ({ context, data }): Promise<{ success: true }> => {
		await deleteProjectUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
		return { success: true };
	});
