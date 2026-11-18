import { createFileRoute } from "@tanstack/react-router";
import { projectMembersQueryOptions } from "#/client/caches/projects/queries/project-members.query";
import { ProjectMembersScreen } from "#/client/features/projects/screens/project-members.screen";

export const Route = createFileRoute("/_auth/projects/$projectId/members")({
	loader: ({ context, params }) =>
		context.queryClient.query(projectMembersQueryOptions(params.projectId)),
	component: ProjectMembersScreen,
});
