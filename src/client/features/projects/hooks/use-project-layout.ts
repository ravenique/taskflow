import { useRouterState } from "@tanstack/react-router";
import { useProjectDetail } from "./use-project-detail";

export function useProjectLayout() {
	const { projectId, project, isPending } = useProjectDetail();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	const basePath = `/projects/${projectId}`;

	return {
		projectId,
		project,
		isPending,
		isOverviewActive: pathname === basePath || pathname === `${basePath}/`,
		isTasksActive: pathname.startsWith(`${basePath}/tasks`),
		isMembersActive: pathname.startsWith(`${basePath}/members`),
		isActivityActive: pathname.startsWith(`${basePath}/activity`),
	};
}
