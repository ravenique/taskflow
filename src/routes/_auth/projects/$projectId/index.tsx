import { createFileRoute } from "@tanstack/react-router";
import { ProjectOverviewScreen } from "#/client/features/projects/screens/project-overview.screen";

export const Route = createFileRoute("/_auth/projects/$projectId/")({
	component: ProjectOverviewScreen,
});
