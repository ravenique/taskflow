import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { rolesListQueryOptions } from "#/client/caches/rbac/queries/roles.query";
import { useSession } from "#/client/features/auth/hooks/use-session";
import type { PermissionDto, RoleDto } from "#/shared/schemas/rbac.schema";

interface RolesAdminContextValue {
	roles: readonly RoleDto[];
	permissions: readonly PermissionDto[];
	selectedRole: RoleDto | null;
	isPending: boolean;
	canManageRoles: boolean;
	isCreateDialogOpen: boolean;
	deletingRole: RoleDto | null;
	selectRole: (roleId: string) => void;
	openCreateDialog: () => void;
	closeCreateDialog: () => void;
	requestDeleteRole: (role: RoleDto) => void;
	closeDeleteDialog: () => void;
}

const RolesAdminContext = createContext<RolesAdminContextValue | null>(null);

export function RolesAdminProvider({ children }: { children: ReactNode }) {
	const { session } = useSession();
	const { data, isPending } = useQuery(rolesListQueryOptions());

	const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [deletingRole, setDeletingRole] = useState<RoleDto | null>(null);

	const roles = data?.roles ?? [];
	const permissions = data?.permissions ?? [];
	const canManageRoles =
		session?.user.systemPermissions.includes("role:manage") ?? false;

	const selectedRole = useMemo(() => {
		if (roles.length === 0) {
			return null;
		}
		return roles.find((role) => role.id === activeRoleId) ?? roles[0];
	}, [roles, activeRoleId]);

	const value: RolesAdminContextValue = {
		roles,
		permissions,
		selectedRole,
		isPending,
		canManageRoles,
		isCreateDialogOpen,
		deletingRole,
		selectRole: (roleId) => setActiveRoleId(roleId),
		openCreateDialog: () => setIsCreateDialogOpen(true),
		closeCreateDialog: () => setIsCreateDialogOpen(false),
		requestDeleteRole: (role) => setDeletingRole(role),
		closeDeleteDialog: () => setDeletingRole(null),
	};

	return (
		<RolesAdminContext.Provider value={value}>
			{children}
		</RolesAdminContext.Provider>
	);
}

export function useRolesAdminContext(): RolesAdminContextValue {
	const ctx = useContext(RolesAdminContext);
	if (!ctx) {
		throw new Error(
			"useRolesAdminContext must be used inside <RolesAdminProvider>",
		);
	}
	return ctx;
}
