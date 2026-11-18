import { queryOptions } from "@tanstack/react-query";
import { listMyAssignedTasksFn } from "#/server-functions/workspace/list-my-assigned-tasks.fn";
import type { MyTasksSearch } from "#/shared/schemas/workspace.schema";
import { workspaceKeys } from "../keys";

export function myAssignedTasksQueryOptions(params: MyTasksSearch) {
	return queryOptions({
		queryKey: workspaceKeys.myTasks(params),
		queryFn: () => listMyAssignedTasksFn({ data: params }),
		staleTime: 15_000,
	});
}
