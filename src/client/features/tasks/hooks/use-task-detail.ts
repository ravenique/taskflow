import { useQuery } from "@tanstack/react-query";
import { taskDetailQueryOptions } from "#/client/caches/tasks/queries/task-detail.query";
import { useSession } from "#/client/features/auth/hooks/use-session";
import { useProjectDetail } from "#/client/features/projects/hooks/use-project-detail";
import { useTaskId } from "./use-task-id";

export function useTaskDetail() {
	const { session } = useSession();
	const { projectId, isArchived, can } = useProjectDetail();
	const taskId = useTaskId();

	const { data: task, isPending } = useQuery({
		...taskDetailQueryOptions(projectId, taskId),
		enabled: Boolean(projectId) && Boolean(taskId),
	});

	return {
		projectId,
		taskId,
		task: task ?? null,
		isPending,
		isArchived,
		currentUserId: session?.user.id ?? "",
		canUpdateTask: can("task:update"),
		canAssignTask: can("task:assign"),
		canDeleteTask: can("task:delete"),
		canCreateComment: can("comment:create"),
		canDeleteAnyComment: can("comment:delete_any"),
	};
}
