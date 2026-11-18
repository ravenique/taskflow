import { queryOptions } from "@tanstack/react-query";
import { listProjectActivityFn } from "#/server-functions/projects/list-project-activity.fn";
import { projectsKeys } from "../keys";

export function projectActivityQueryOptions(projectId: string) {
	return queryOptions({
		queryKey: projectsKeys.activity(projectId),
		queryFn: () => listProjectActivityFn({ data: { projectId, limit: 50 } }),
		staleTime: 15_000,
	});
}
