import { queryOptions } from "@tanstack/react-query";
import { listProjectsFn } from "#/server-functions/projects/list-projects.fn";
import type { ProjectsSearch } from "#/shared/schemas/project.schema";
import { projectsKeys } from "../keys";

export function projectsListQueryOptions(params: ProjectsSearch) {
	return queryOptions({
		queryKey: projectsKeys.list(params),
		queryFn: () => listProjectsFn({ data: params }),
		staleTime: 30_000,
	});
}
