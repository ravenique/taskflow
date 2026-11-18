import { queryOptions } from "@tanstack/react-query";
import { listProjectMembersFn } from "#/server-functions/projects/list-project-members.fn";
import { projectsKeys } from "../keys";

export function projectMembersQueryOptions(projectId: string) {
	return queryOptions({
		queryKey: projectsKeys.members(projectId),
		queryFn: () => listProjectMembersFn({ data: { projectId } }),
		staleTime: 30_000,
	});
}
