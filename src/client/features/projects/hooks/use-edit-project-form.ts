import { useEffect } from "react";
import { useUpdateProjectMutation } from "#/client/caches/projects/mutates/update-project.mutate";
import { useAppForm } from "#/client/shared/components/app-form";
import { updateProjectInputSchema } from "#/shared/schemas/project.schema";
import { useProjectsContext } from "../contexts/projects.context";

export function useEditProjectForm() {
	const { editingProject, closeEditDialog } = useProjectsContext();
	const updateMutation = useUpdateProjectMutation();

	const form = useAppForm({
		defaultValues: {
			projectId: editingProject?.id ?? "",
			name: editingProject?.name ?? "",
			description: editingProject?.description ?? "",
		},
		validators: {
			onBlur: updateProjectInputSchema,
			onSubmit: updateProjectInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await updateMutation.mutateAsync(value);
				closeEditDialog();
			} catch {
				return;
			}
		},
	});

	useEffect(() => {
		if (!editingProject) {
			return;
		}
		form.reset({
			projectId: editingProject.id,
			name: editingProject.name,
			description: editingProject.description,
		});
	}, [editingProject, form]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeEditDialog();
		}
	};

	return {
		editingProject,
		handleOpenChange,
		form,
	};
}
