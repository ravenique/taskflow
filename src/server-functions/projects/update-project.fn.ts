import { createServerFn } from "@tanstack/react-start";
import { updateProjectUseCase } from "#/server/composition/projects.container";
import type { ProjectDto } from "#/shared/schemas/project.schema";
import { updateProjectInputSchema } from "#/shared/schemas/project.schema";
import { requireAuthMiddleware } from "../middlewares/auth.middleware";
import { domainErrorMiddleware } from "../middlewares/domain-error.middleware";

export const updateProjectFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(updateProjectInputSchema)
	.handler(async ({ context, data }): Promise<ProjectDto> => {
		return updateProjectUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
