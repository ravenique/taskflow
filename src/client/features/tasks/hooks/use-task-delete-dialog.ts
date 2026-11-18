import { useNavigate } from "@tanstack/react-router";
import { useDeleteTaskMutation } from "#/client/caches/tasks/mutates/delete-task.mutate";
import { useTaskDetailContext } from "../contexts/task-detail.context";
import { useTaskDetail } from "./use-task-detail";

export function useTaskDeleteDialog() {
	const navigate = useNavigate();
	const { projectId, task } = useTaskDetail();
	const { isDeleteDialogOpen, closeDeleteDialog } = useTaskDetailContext();
	const deleteMutation = useDeleteTaskMutation();

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeDeleteDialog();
		}
	};

	const handleConfirmDelete = async () => {
		if (!projectId || !task) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({
				projectId,
				taskId: task.id,
			});
			closeDeleteDialog();
			await navigate({
				to: "/projects/$projectId/tasks",
				params: { projectId },
			});
		} catch {
			// Error toast is centrally handled by MutationCache in client/caches/global.ts
			return;
		}
	};

	return {
		task,
		isOpen: isDeleteDialogOpen,
		isDeleting: deleteMutation.isPending,
		handleOpenChange,
		handleConfirmDelete,
	};
}
