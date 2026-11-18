import { formatTaskDueDate } from "#/client/shared/helpers/task-display";
import { useTaskDetailContext } from "../contexts/task-detail.context";
import { useTaskDetail } from "./use-task-detail";

export function useTaskSummary() {
	const { projectId, task, isPending, isArchived, canDeleteTask } =
		useTaskDetail();
	const { openDeleteDialog } = useTaskDetailContext();

	return {
		projectId,
		task,
		isPending,
		isArchived,
		canDeleteTask: canDeleteTask && !isArchived,
		dueDateLabel: formatTaskDueDate(task?.dueDate ?? null),
		updatedAtLabel: task ? new Date(task.updatedAt).toLocaleString() : "",
		openDeleteDialog,
	};
}
