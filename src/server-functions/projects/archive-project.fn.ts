import { createServerFn } from "@tanstack/react-start";
import { archiveProjectUseCase } from "#/server/composition/projects.container";
import type { ProjectDto } from "#/shared/schemas/project.schema";
import { projectActionInputSchema } from "#/shared/schemas/project.schema";
import { requireAuthMiddleware } from "../middlewares/auth.middleware";
import { domainErrorMiddleware } from "../middlewares/domain-error.middleware";

export const archiveProjectFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(projectActionInputSchema)
	.handler(async ({ context, data }): Promise<ProjectDto> => {
		return archiveProjectUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
