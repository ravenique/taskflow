import { useMemo } from "react";
import { formatActivityLogItem } from "#/client/shared/helpers/activity-formatter";
import { useTaskDetail } from "./use-task-detail";

export function useTaskActivity() {
	const { task, isPending } = useTaskDetail();

	const items = useMemo(
		() => (task?.activities ?? []).map(formatActivityLogItem),
		[task?.activities],
	);

	return {
		items,
		isPending,
	};
}
