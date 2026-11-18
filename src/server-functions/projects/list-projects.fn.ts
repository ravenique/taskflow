import { createServerFn } from "@tanstack/react-start";
import { listProjectsUseCase } from "#/server/composition/projects.container";
import type { ListProjectsResultDto } from "#/shared/schemas/project.schema";
import { projectsSearchSchema } from "#/shared/schemas/project.schema";
import { requireAuthMiddleware } from "../middlewares/auth.middleware";
import { domainErrorMiddleware } from "../middlewares/domain-error.middleware";

export const listProjectsFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(projectsSearchSchema)
	.handler(async ({ context, data }): Promise<ListProjectsResultDto> => {
		return listProjectsUseCase.execute({
			actorUserId: context.authSession.user.id,
			actorSystemPermissions: context.authSession.user.systemPermissions,
			payload: data,
		});
	});
