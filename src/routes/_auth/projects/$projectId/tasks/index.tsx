import { createFileRoute } from "@tanstack/react-router";
import { projectMembersQueryOptions } from "#/client/caches/projects/queries/project-members.query";
import { tasksListQueryOptions } from "#/client/caches/tasks/queries/tasks.query";
import { ProjectTasksScreen } from "#/client/features/tasks/screens/project-tasks.screen";
import { tasksSearchSchema } from "#/shared/schemas/task.schema";

export const Route = createFileRoute("/_auth/projects/$projectId/tasks/")({
	validateSearch: tasksSearchSchema,
	loaderDeps: ({ search }) => search,
	loader: ({ context, params, deps }) =>
		Promise.all([
			context.queryClient.query(tasksListQueryOptions(params.projectId, deps)),
			context.queryClient.query(projectMembersQueryOptions(params.projectId)),
		]),
	component: ProjectTasksScreen,
});
