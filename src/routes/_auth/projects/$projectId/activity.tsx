import { createFileRoute } from "@tanstack/react-router";
import { projectActivityQueryOptions } from "#/client/caches/projects/queries/project-activity.query";
import { ProjectActivityScreen } from "#/client/features/projects/screens/project-activity.screen";

export const Route = createFileRoute("/_auth/projects/$projectId/activity")({
	loader: ({ context, params }) =>
		context.queryClient.query(projectActivityQueryOptions(params.projectId)),
	component: ProjectActivityScreen,
});
