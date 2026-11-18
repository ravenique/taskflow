import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { projectActivityQueryOptions } from "#/client/caches/projects/queries/project-activity.query";
import { formatActivityLogItem } from "#/client/shared/helpers/activity-formatter";
import { useProjectId } from "./use-project-id";

export function useProjectActivity() {
	const projectId = useProjectId();
	const { data: logs = [], isPending } = useQuery({
		...projectActivityQueryOptions(projectId),
		enabled: Boolean(projectId),
	});

	const items = useMemo(() => logs.map(formatActivityLogItem), [logs]);

	return {
		items,
		isPending,
	};
}
