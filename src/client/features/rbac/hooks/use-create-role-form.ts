import { useCreateRoleMutation } from "#/client/caches/rbac/mutates/create-role.mutate";
import type { AppFormSelectOption } from "#/client/shared/components/app-form";
import { useAppForm } from "#/client/shared/components/app-form";
import type { RoleScope } from "#/shared/schemas/rbac.schema";
import { createRoleInputSchema } from "#/shared/schemas/rbac.schema";
import { useRolesAdminContext } from "../contexts/roles-admin.context";

export const ROLE_SCOPE_OPTIONS: readonly AppFormSelectOption[] = [
	{ label: "System Level (system)", value: "system" },
	{ label: "Project Level (project)", value: "project" },
];

export function useCreateRoleForm() {
	const { isCreateDialogOpen, closeCreateDialog, selectRole } =
		useRolesAdminContext();
	const createRoleMutation = useCreateRoleMutation();

	const form = useAppForm({
		defaultValues: {
			name: "",
			slug: "",
			scope: "system" as RoleScope,
			description: "",
			permissionIds: [] as string[],
		},
		validators: {
			onBlur: createRoleInputSchema,
			onSubmit: createRoleInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const createdRole = await createRoleMutation.mutateAsync(value);
				selectRole(createdRole.id);
				form.reset();
				closeCreateDialog();
			} catch {
				// Error toast is centrally handled by MutationCache in client/caches/global.ts
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
