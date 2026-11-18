import { GetWorkspaceOverviewUseCase } from "#/server/application/workspace/get-workspace-overview.use-case";
import { ListMyAssignedTasksUseCase } from "#/server/application/workspace/list-my-assigned-tasks.use-case";
import { authorizationService } from "./rbac.container";
import { workspaceQueries } from "./repositories";

export const getWorkspaceOverviewUseCase = new GetWorkspaceOverviewUseCase(
	workspaceQueries,
	authorizationService,
);

export const listMyAssignedTasksUseCase = new ListMyAssignedTasksUseCase(
	workspaceQueries,
	authorizationService,
);
