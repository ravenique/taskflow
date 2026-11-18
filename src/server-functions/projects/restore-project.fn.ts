import { createServerFn } from "@tanstack/react-start";
import { restoreProjectUseCase } from "#/server/composition/projects.container";
import type { ProjectDto } from "#/shared/schemas/project.schema";
import { projectActionInputSchema } from "#/shared/schemas/project.schema";
import { requireAuthMiddleware } from "../middlewares/auth.middleware";
import { domainErrorMiddleware } from "../middlewares/domain-error.middleware";

export const restoreProjectFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(projectActionInputSchema)
	.handler(async ({ context, data }): Promise<ProjectDto> => {
		return restoreProjectUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
