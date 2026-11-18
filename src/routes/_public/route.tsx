import { createFileRoute, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "#/client/caches/auth/queries/session.query";
import { AuthLayout } from "#/client/features/auth/screens/auth.layout";

export const Route = createFileRoute("/_public")({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.query(sessionQueryOptions());
		if (session) {
			throw redirect({
				to: "/",
			});
		}
	},
	component: AuthLayout,
});
