import { queryOptions } from "@tanstack/react-query";
import { getTaskDetailFn } from "#/server-functions/tasks/get-task-detail.fn";
import { tasksKeys } from "../keys";

export function taskDetailQueryOptions(projectId: string, taskId: string) {
	return queryOptions({
		queryKey: tasksKeys.detail(projectId, taskId),
		queryFn: () => getTaskDetailFn({ data: { projectId, taskId } }),
		staleTime: 15_000,
	});
}
