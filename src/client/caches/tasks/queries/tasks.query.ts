import { queryOptions } from "@tanstack/react-query";
import { listTasksFn } from "#/server-functions/tasks/list-tasks.fn";
import type { TasksSearch } from "#/shared/schemas/task.schema";
import { tasksKeys } from "../keys";

export function tasksListQueryOptions(projectId: string, params: TasksSearch) {
	return queryOptions({
		queryKey: tasksKeys.list(projectId, params),
		queryFn: () => listTasksFn({ data: { projectId, params } }),
		staleTime: 15_000,
	});
}
