import { useEffect, useMemo } from "react";
import { useUpdateRolePermissionsMutation } from "#/client/caches/rbac/mutates/update-role-permissions.mutate";
import { useAppForm } from "#/client/shared/components/app-form";
import { updateRolePermissionsInputSchema } from "#/shared/schemas/rbac.schema";
import { useRolesAdminContext } from "../contexts/roles-admin.context";

export function usePermissionMatrixForm() {
	const { selectedRole, permissions, canManageRoles, isPending } =
		useRolesAdminContext();
	const updateMutation = useUpdateRolePermissionsMutation();

	const scopedPermissions = useMemo(() => {
		if (!selectedRole) {
			return [];
		}
		return permissions.filter(
			(permission) => permission.scope === selectedRole.scope,
		);
	}, [permissions, selectedRole]);

	const form = useAppForm({
		defaultValues: {
			roleId: selectedRole?.id ?? "",
			permissionIds: selectedRole?.permissionIds ?? [],
		},
		validators: {
			onSubmit: updateRolePermissionsInputSchema,
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
		if (!selectedRole) {
			return;
		}
		form.reset({
			roleId: selectedRole.id,
			permissionIds: selectedRole.permissionIds,
		});
	}, [selectedRole, form]);

	const togglePermissionId = (
		currentIds: readonly string[],
		targetId: string,
		checked: boolean,
	): string[] => {
		if (checked) {
			return currentIds.includes(targetId)
				? [...currentIds]
				: [...currentIds, targetId];
		}
		return currentIds.filter((id) => id !== targetId);
	};

	return {
		isPending,
		selectedRole,
		scopedPermissions,
		canManageRoles,
		form,
		togglePermissionId,
	};
}
