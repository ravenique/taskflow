import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { assignableRolesQueryOptions } from "#/client/caches/rbac/queries/assignable-roles.query";
import { useAssignUserRolesMutation } from "#/client/caches/users/mutates/assign-user-roles.mutate";
import { useSession } from "#/client/features/auth/hooks/use-session";
import { useAppForm } from "#/client/shared/components/app-form";
import { assignUserSystemRolesInputSchema } from "#/shared/schemas/user.schema";
import { useUsersAdminContext } from "../contexts/users-admin.context";

export function useAssignUserRolesForm() {
	const { session } = useSession();
	const { editingUser, closeAssignRolesDialog } = useUsersAdminContext();
	const canAssignRoles =
		session?.user.systemPermissions.includes("user:assign_role") ?? false;

	const { data: systemRoles = [], isPending: isLoadingRoles } = useQuery({
		...assignableRolesQueryOptions(),
		enabled: canAssignRoles && Boolean(editingUser),
	});

	const assignMutation = useAssignUserRolesMutation();

	const form = useAppForm({
		defaultValues: {
			userId: editingUser?.id ?? "",
			roleIds: editingUser?.systemRoles.map((role) => role.id) ?? [],
		},
		validators: {
			onSubmit: assignUserSystemRolesInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await assignMutation.mutateAsync(value);
				closeAssignRolesDialog();
			} catch {
				// Error toast is centrally handled by MutationCache in client/caches/global.ts
				return;
			}
		},
	});

	useEffect(() => {
		if (!editingUser) {
			return;
		}
		form.reset({
			userId: editingUser.id,
			roleIds: editingUser.systemRoles.map((role) => role.id),
		});
	}, [editingUser, form]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeAssignRolesDialog();
		}
	};

	const toggleRoleId = (
		currentIds: readonly string[],
		roleId: string,
		checked: boolean,
	): string[] => {
		if (checked) {
			return currentIds.includes(roleId)
				? [...currentIds]
				: [...currentIds, roleId];
		}
		return currentIds.filter((id) => id !== roleId);
	};

	return {
		editingUser,
		systemRoles,
		isLoadingRoles,
		handleOpenChange,
		form,
		toggleRoleId,
	};
}
