import { createFileRoute } from "@tanstack/react-router";
import { projectMembersQueryOptions } from "#/client/caches/projects/queries/project-members.query";
import { taskDetailQueryOptions } from "#/client/caches/tasks/queries/task-detail.query";
import { TaskDetailScreen } from "#/client/features/tasks/screens/task-detail.screen";
import { TaskRouteErrorScreen } from "#/client/features/tasks/screens/task-route-error.screen";

export const Route = createFileRoute(
	"/_auth/projects/$projectId/tasks/$taskId",
)({
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.query(
				taskDetailQueryOptions(params.projectId, params.taskId),
			),
			context.queryClient.query(projectMembersQueryOptions(params.projectId)),
		]),
	errorComponent: TaskRouteErrorScreen,
	component: TaskDetailScreen,
});
