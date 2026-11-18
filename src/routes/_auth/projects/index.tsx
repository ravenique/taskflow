import { createFileRoute } from "@tanstack/react-router";
import { projectsListQueryOptions } from "#/client/caches/projects/queries/projects.query";
import { ProjectsScreen } from "#/client/features/projects/screens/projects.screen";
import { projectsSearchSchema } from "#/shared/schemas/project.schema";

export const Route = createFileRoute("/_auth/projects/")({
	validateSearch: projectsSearchSchema,
	loaderDeps: ({ search }) => search,
	loader: ({ context, deps }) =>
		context.queryClient.query(projectsListQueryOptions(deps)),
	component: ProjectsScreen,
});
