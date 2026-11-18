import { createServerFn } from "@tanstack/react-start";
import { removeProjectMemberUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import { removeProjectMemberInputSchema } from "#/shared/schemas/project.schema";

export const removeProjectMemberFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(removeProjectMemberInputSchema)
	.handler(async ({ context, data }): Promise<{ success: true }> => {
		await removeProjectMemberUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
		return { success: true };
	});
