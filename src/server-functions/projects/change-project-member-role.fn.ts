import { createServerFn } from "@tanstack/react-start";
import { changeProjectMemberRoleUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import { changeProjectMemberRoleInputSchema } from "#/shared/schemas/project.schema";

export const changeProjectMemberRoleFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(changeProjectMemberRoleInputSchema)
	.handler(async ({ context, data }): Promise<{ success: true }> => {
		await changeProjectMemberRoleUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
		return { success: true };
	});
