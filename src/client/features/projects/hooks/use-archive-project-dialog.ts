import { useArchiveProjectMutation } from "#/client/caches/projects/mutates/archive-project.mutate";
import { useRestoreProjectMutation } from "#/client/caches/projects/mutates/restore-project.mutate";
import { useProjectsContext } from "../contexts/projects.context";

export function useArchiveProjectDialog() {
	const { archiveTarget, closeArchiveDialog } = useProjectsContext();
	const archiveMutation = useArchiveProjectMutation();
	const restoreMutation = useRestoreProjectMutation();

	const isSubmitting = archiveMutation.isPending || restoreMutation.isPending;

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeArchiveDialog();
		}
	};

	const handleConfirm = async () => {
		if (!archiveTarget) {
			return;
		}

		try {
			if (archiveTarget.mode === "archive") {
				await archiveMutation.mutateAsync({
					projectId: archiveTarget.project.id,
				});
			} else {
				await restoreMutation.mutateAsync({
					projectId: archiveTarget.project.id,
				});
			}
			closeArchiveDialog();
		} catch {
			return;
		}
	};
	return {
		archiveTarget,
		isSubmitting,
		handleOpenChange,
		handleConfirm,
	};
}
