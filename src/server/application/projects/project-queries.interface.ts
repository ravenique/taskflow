import type {
	ActivityLogDto,
	ListProjectMembersResultDto,
	ListProjectsResultDto,
	ProjectDetailDto,
	ProjectsSearch,
} from "#/shared/schemas/project.schema";

export interface ListProjectsQueryInput {
	readonly actorUserId: string;
	readonly includeAllProjects: boolean;
	readonly params: ProjectsSearch;
}

export interface IProjectQueries {
	listProjects(input: ListProjectsQueryInput): Promise<ListProjectsResultDto>;
	findProjectDetailById(
		projectId: string,
		actorUserId: string,
	): Promise<ProjectDetailDto | null>;
	listProjectMembers(projectId: string): Promise<ListProjectMembersResultDto>;
	listProjectActivity(
		projectId: string,
		limit: number,
	): Promise<ActivityLogDto[]>;
}
