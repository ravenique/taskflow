import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { workspaceOverviewQueryOptions } from "#/client/caches/workspace/queries/workspace-overview.query";
import { useSession } from "#/client/features/auth/hooks/use-session";
import { formatActivityLogItem } from "#/client/shared/helpers/activity-formatter";

export function useWorkspaceOverview() {
	const { session } = useSession();
	const { data, isPending } = useQuery(workspaceOverviewQueryOptions());

	const canCreateProject =
		session?.user.systemPermissions.includes("project:create") ?? false;

	const activeProjects = useMemo(
		() =>
			(data?.activeProjects ?? []).map((project) => ({
				...project,
				updatedAtLabel: new Date(project.updatedAt).toLocaleString(),
			})),
		[data?.activeProjects],
	);

	const recentActivities = useMemo(
		() =>
			(data?.recentActivities ?? []).map((log) => ({
				...formatActivityLogItem(log),
				projectId: log.projectId,
				taskId: log.taskId,
			})),
		[data?.recentActivities],
	);

	return {
		summary: data?.summary ?? {
			activeProjectCount: 0,
			archivedProjectCount: 0,
			assignedOpenTaskCount: 0,
			assignedDoneTaskCount: 0,
		},
		activeProjects,
		recentActivities,
		canCreateProject,
		isPending,
	};
}
