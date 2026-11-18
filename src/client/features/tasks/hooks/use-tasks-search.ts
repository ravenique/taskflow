import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";
import { useProjectId } from "#/client/features/projects/hooks/use-project-id";
import type { TasksSearch } from "#/shared/schemas/task.schema";
import { tasksSearchSchema } from "#/shared/schemas/task.schema";

export function useTasksSearch() {
	const navigate = useNavigate();
	const projectId = useProjectId();
	const rawSearch = useSearch({ strict: false });
	const search = tasksSearchSchema.parse(rawSearch);

	const updateSearch = useCallback(
		(patch: Partial<TasksSearch>) => {
			if (!projectId) {
				return;
			}
			void navigate({
				to: "/projects/$projectId/tasks",
				params: { projectId },
				search: (prev) => ({
					...tasksSearchSchema.parse(prev),
					...patch,
				}),
			});
		},
		[navigate, projectId],
	);

	return {
		projectId,
		search,
		updateSearch,
	};
}
