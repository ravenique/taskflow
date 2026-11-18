import { queryOptions } from "@tanstack/react-query";
import { getProjectDetailFn } from "#/server-functions/projects/get-project-detail.fn";
import { projectsKeys } from "../keys";

export function projectDetailQueryOptions(projectId: string) {
	return queryOptions({
		queryKey: projectsKeys.detail(projectId),
		queryFn: () => getProjectDetailFn({ data: { projectId } }),
		staleTime: 30_000,
	});
}
