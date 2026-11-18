import { useCreateProjectMutation } from "#/client/caches/projects/mutates/create-project.mutate";
import { useAppForm } from "#/client/shared/components/app-form";
import { createProjectInputSchema } from "#/shared/schemas/project.schema";
import { useProjectsContext } from "../contexts/projects.context";

export function useCreateProjectForm() {
	const { isCreateDialogOpen, closeCreateDialog } = useProjectsContext();
	const createMutation = useCreateProjectMutation();

	const form = useAppForm({
		defaultValues: {
			key: "",
			name: "",
			description: "",
		},
		validators: {
			onBlur: createProjectInputSchema,
			onSubmit: createProjectInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await createMutation.mutateAsync(value);
				form.reset();
				closeCreateDialog();
			} catch {
				return;
			}
		},
	});

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			form.reset();
			closeCreateDialog();
		}
	};

	return {
		isOpen: isCreateDialogOpen,
		handleOpenChange,
		form,
	};
}
