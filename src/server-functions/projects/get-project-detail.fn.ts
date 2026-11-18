import { createServerFn } from "@tanstack/react-start";
import { getProjectDetailUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { ProjectDetailDto } from "#/shared/schemas/project.schema";
import { getProjectDetailInputSchema } from "#/shared/schemas/project.schema";

export const getProjectDetailFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(getProjectDetailInputSchema)
	.handler(async ({ context, data }): Promise<ProjectDetailDto> => {
		return getProjectDetailUseCase.execute({
			actorUserId: context.authSession.user.id,
			actorSystemPermissions: context.authSession.user.systemPermissions,
			payload: data,
		});
	});
