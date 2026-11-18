import { useTransitionTaskStatusMutation } from "#/client/caches/tasks/mutates/transition-task-status.mutate";
import type { TaskStatus } from "#/shared/schemas/task.schema";
import { useTaskDetail } from "./use-task-detail";

export function useTaskStatusActions() {
	const { projectId, task, isArchived, canUpdateTask } = useTaskDetail();
	const transitionMutation = useTransitionTaskStatusMutation();

	const handleTransition = async (nextStatus: TaskStatus) => {
		if (!task || !projectId) {
			return;
		}
		try {
			await transitionMutation.mutateAsync({
				projectId,
				taskId: task.id,
				status: nextStatus,
			});
		} catch {
			// Error toast is centrally handled by MutationCache in client/caches/global.ts
			return;
		}
	};

	return {
		currentStatus: task?.status ?? null,
		allowedTransitions: task?.allowedTransitions ?? [],
		canUpdateTask,
		isArchived,
		isTransitioning: transitionMutation.isPending,
		pendingStatus: transitionMutation.variables?.status ?? null,
		handleTransition,
	};
}
