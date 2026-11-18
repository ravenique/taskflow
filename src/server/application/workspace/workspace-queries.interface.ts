import type {
	ListMyAssignedTasksResultDto,
	MyTasksSearch,
	WorkspaceOverviewDto,
} from "#/shared/schemas/workspace.schema";

export interface WorkspaceOverviewQueryInput {
	actorUserId: string;
	includeAllProjects: boolean;
}

export interface ListMyAssignedTasksQueryInput {
	actorUserId: string;
	includeAllProjects: boolean;
	params: MyTasksSearch;
}

export interface IWorkspaceQueries {
	getWorkspaceOverview(
		input: WorkspaceOverviewQueryInput,
	): Promise<WorkspaceOverviewDto>;
	listMyAssignedTasks(
		input: ListMyAssignedTasksQueryInput,
	): Promise<ListMyAssignedTasksResultDto>;
}
