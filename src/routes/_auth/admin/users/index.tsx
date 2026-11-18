import { createFileRoute, redirect } from "@tanstack/react-router";
import { adminUsersQueryOptions } from "#/client/caches/users/queries/users.query";
import { UsersAdminScreen } from "#/client/features/users/screens/users-admin.screen";

export const Route = createFileRoute("/_auth/admin/users/")({
	beforeLoad: ({ context }) => {
		const canReadUsers = context.user.systemPermissions.includes("user:read");
		if (!canReadUsers) {
			throw redirect({ to: "/" });
		}
	},
	loader: ({ context }) =>
		context.queryClient.query(adminUsersQueryOptions("")),
	component: UsersAdminScreen,
});
