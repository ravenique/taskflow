import { queryOptions } from "@tanstack/react-query";
import { getWorkspaceOverviewFn } from "#/server-functions/workspace/get-workspace-overview.fn";
import { workspaceKeys } from "../keys";

export function workspaceOverviewQueryOptions() {
	return queryOptions({
		queryKey: workspaceKeys.overview(),
		queryFn: () => getWorkspaceOverviewFn(),
		staleTime: 15_000,
	});
}
