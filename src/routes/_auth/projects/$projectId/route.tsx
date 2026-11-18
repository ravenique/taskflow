import { createFileRoute } from "@tanstack/react-router";
import { projectDetailQueryOptions } from "#/client/caches/projects/queries/project-detail.query";
import { ProjectDetailLayout } from "#/client/features/projects/screens/project-detail.layout";
import { ProjectRouteErrorScreen } from "#/client/features/projects/screens/project-route-error.screen";

export const Route = createFileRoute("/_auth/projects/$projectId")({
	loader: ({ context, params }) =>
		context.queryClient.query(projectDetailQueryOptions(params.projectId)),
	errorComponent: ProjectRouteErrorScreen,
	component: ProjectDetailLayout,
});
