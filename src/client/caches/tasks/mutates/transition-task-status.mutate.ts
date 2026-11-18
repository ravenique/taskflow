import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsKeys } from "#/client/caches/projects/keys";
import { workspaceKeys } from "#/client/caches/workspace/keys";
import { transitionTaskStatusFn } from "#/server-functions/tasks/transition-task-status.fn";
import type { TransitionTaskStatusInput } from "#/shared/schemas/task.schema";
import { tasksKeys } from "../keys";

export function useTransitionTaskStatusMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: TransitionTaskStatusInput) =>
			transitionTaskStatusFn({ data: input }),
		meta: {
			successToast: "อัปเดตสถานะงานสำเร็จ",
		},
		onSuccess: async (_data, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: tasksKeys.project(variables.projectId),
				}),
				queryClient.invalidateQueries({
					queryKey: projectsKeys.activity(variables.projectId),
				}),
				queryClient.invalidateQueries({
					queryKey: workspaceKeys.all,
				}),
			]);
		},
	});
}
