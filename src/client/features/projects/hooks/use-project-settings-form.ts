import { useEffect } from "react";
import { useArchiveProjectMutation } from "#/client/caches/projects/mutates/archive-project.mutate";
import { useRestoreProjectMutation } from "#/client/caches/projects/mutates/restore-project.mutate";
import { useUpdateProjectMutation } from "#/client/caches/projects/mutates/update-project.mutate";
import { useAppForm } from "#/client/shared/components/app-form";
import { updateProjectInputSchema } from "#/shared/schemas/project.schema";
import { useProjectOverviewContext } from "../contexts/project-overview.context";
import { useProjectDetail } from "./use-project-detail";

export function useProjectSettingsForm() {
	const { project, isArchived, can } = useProjectDetail();
	const { openDeleteDialog } = useProjectOverviewContext();
	const updateMutation = useUpdateProjectMutation();
	const archiveMutation = useArchiveProjectMutation();
	const restoreMutation = useRestoreProjectMutation();

	const canUpdate = can("project:update");
	const canDelete = can("project:delete");
	const isTogglingStatus =
		archiveMutation.isPending || restoreMutation.isPending;

	const form = useAppForm({
		defaultValues: {
			projectId: project?.id ?? "",
			name: project?.name ?? "",
			description: project?.description ?? "",
		},
		validators: {
			onBlur: updateProjectInputSchema,
			onSubmit: updateProjectInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await updateMutation.mutateAsync(value);
			} catch {
				// Error toast is centrally handled by MutationCache in client/caches/global.ts
				return;
			}
		},
	});

	useEffect(() => {
		if (!project) {
			return;
		}
		form.reset({
			projectId: project.id,
			name: project.name,
			description: project.description,
		});
	}, [project, form]);

	const handleToggleStatus = async () => {
		if (!project) {
			return;
		}
		try {
			if (isArchived) {
				await restoreMutation.mutateAsync({ projectId: project.id });
				return;
			}
			await archiveMutation.mutateAsync({ projectId: project.id });
		} catch {
			// Error toast is centrally handled by MutationCache in client/caches/global.ts
			return;
		}
	};

	return {
		project,
		isArchived,
		canUpdate,
		canDelete,
		isTogglingStatus,
		form,
		handleToggleStatus,
		openDeleteDialog,
	};
}
