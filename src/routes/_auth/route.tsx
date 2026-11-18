import { createFileRoute, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "#/client/caches/auth/queries/session.query";
import { WorkspaceLayout } from "#/client/features/workspace/screens/workspace.layout";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ context, location }) => {
		const session = await context.queryClient.query(sessionQueryOptions());

		if (!session) {
			throw redirect({
				to: "/sign-in",
				search: { redirect: location.href },
			});
		}
		return session;
	},
	component: WorkspaceLayout,
});
