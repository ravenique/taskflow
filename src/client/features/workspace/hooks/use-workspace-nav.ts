import { useRouterState } from "@tanstack/react-router";
import { useSession } from "#/client/features/auth/hooks/use-session";

export function useWorkspaceNav() {
	const { session, isAuthenticated } = useSession();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	const grantedPermissions = session?.user.systemPermissions ?? [];
	const canReadRoles = grantedPermissions.includes("role:read");
	const canReadUsers = grantedPermissions.includes("user:read");

	return {
		isAuthenticated,
		canReadRoles,
		canReadUsers,
		isWorkspaceActive: pathname === "/",
		isProjectsActive: pathname.startsWith("/projects"),
		isRolesActive: pathname.startsWith("/admin/roles"),
		isUsersActive: pathname.startsWith("/admin/users"),
	};
}
