import { useRolesAdminContext } from "../contexts/roles-admin.context";

export function useRolesList() {
	const {
		roles,
		selectedRole,
		isPending,
		canManageRoles,
		selectRole,
		openCreateDialog,
		requestDeleteRole,
	} = useRolesAdminContext();

	return {
		roles,
		selectedRoleId: selectedRole?.id ?? null,
		isPending,
		canManageRoles,
		selectRole,
		openCreateDialog,
		requestDeleteRole,
	};
}
