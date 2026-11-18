import { useNavigate } from "@tanstack/react-router";
import { useDeleteProjectMutation } from "#/client/caches/projects/mutates/delete-project.mutate";
import { useProjectOverviewContext } from "../contexts/project-overview.context";
import { useProjectDetail } from "./use-project-detail";

export function useDeleteProjectDialog() {
	const navigate = useNavigate();
	const { project } = useProjectDetail();
	const { isDeleteDialogOpen, closeDeleteDialog } = useProjectOverviewContext();
	const deleteMutation = useDeleteProjectMutation();

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeDeleteDialog();
		}
	};

	const handleConfirmDelete = async () => {
		if (!project) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({ projectId: project.id });
			closeDeleteDialog();
			await navigate({ to: "/projects" });
		} catch {
			// Error toast is centrally handled by MutationCache in client/caches/global.ts
			return;
		}
	};

	return {
		project,
		isOpen: isDeleteDialogOpen,
		isDeleting: deleteMutation.isPending,
		handleOpenChange,
		handleConfirmDelete,
	};
}
