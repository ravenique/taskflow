import { useDeleteRoleMutation } from "#/client/caches/rbac/mutates/delete-role.mutate";
import { useRolesAdminContext } from "../contexts/roles-admin.context";

export function useDeleteRoleDialog() {
	const { deletingRole, closeDeleteDialog } = useRolesAdminContext();
	const deleteMutation = useDeleteRoleMutation();

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeDeleteDialog();
		}
	};

	const handleConfirmDelete = async () => {
		if (!deletingRole) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({ roleId: deletingRole.id });
			closeDeleteDialog();
		} catch {
			// Error toast is centrally handled by MutationCache in client/caches/global.ts
			return;
		}
	};

	return {
		deletingRole,
		isDeleting: deleteMutation.isPending,
		handleOpenChange,
		handleConfirmDelete,
	};
}
