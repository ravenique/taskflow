import { createServerFn } from "@tanstack/react-start";
import { addProjectMemberUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import { addProjectMemberInputSchema } from "#/shared/schemas/project.schema";

export const addProjectMemberFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(addProjectMemberInputSchema)
	.handler(async ({ context, data }): Promise<{ success: true }> => {
		await addProjectMemberUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
		return { success: true };
	});
