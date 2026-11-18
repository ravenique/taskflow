import { createServerFn } from "@tanstack/react-start";
import { getWorkspaceOverviewUseCase } from "#/server/composition/workspace.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { WorkspaceOverviewDto } from "#/shared/schemas/workspace.schema";

export const getWorkspaceOverviewFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.handler(async ({ context }): Promise<WorkspaceOverviewDto> => {
		return getWorkspaceOverviewUseCase.execute({
			actorUserId: context.authSession.user.id,
			actorSystemPermissions: context.authSession.user.systemPermissions,
		});
	});
