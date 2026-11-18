import { createServerFn } from "@tanstack/react-start";
import { createProjectUseCase } from "#/server/composition/projects.container";
import type { ProjectDto } from "#/shared/schemas/project.schema";
import { createProjectInputSchema } from "#/shared/schemas/project.schema";
import { requireSystemPermission } from "../middlewares/permission.middleware";

export const createProjectFn = createServerFn({ method: "POST" })
	.middleware([requireSystemPermission("project:create")])
	.validator(createProjectInputSchema)
	.handler(async ({ context, data }): Promise<ProjectDto> => {
		return createProjectUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
