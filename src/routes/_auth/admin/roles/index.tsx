import { createFileRoute, redirect } from "@tanstack/react-router";
import { rolesListQueryOptions } from "#/client/caches/rbac/queries/roles.query";
import { RolesAdminScreen } from "#/client/features/rbac/screens/roles-admin.screen";

export const Route = createFileRoute("/_auth/admin/roles/")({
	beforeLoad: ({ context }) => {
		const canReadRoles = context.user.systemPermissions.includes("role:read");
		if (!canReadRoles) {
			throw redirect({ to: "/" });
		}
	},
	loader: ({ context }) => context.queryClient.query(rolesListQueryOptions()),
	component: RolesAdminScreen,
});
