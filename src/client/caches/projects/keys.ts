import type { ProjectsSearch } from "#/shared/schemas/project.schema";

export const projectsKeys = {
	all: ["projects"] as const,
	list: (params: ProjectsSearch) =>
		[...projectsKeys.all, "list", params] as const,
	detail: (projectId: string) =>
		[...projectsKeys.all, "detail", projectId] as const,
	members: (projectId: string) =>
		[...projectsKeys.all, "members", projectId] as const,
	activity: (projectId: string) =>
		[...projectsKeys.all, "activity", projectId] as const,
};
