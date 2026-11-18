import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsKeys } from "#/client/caches/projects/keys";
import { workspaceKeys } from "#/client/caches/workspace/keys";
import { assignTaskFn } from "#/server-functions/tasks/assign-task.fn";
import type { AssignTaskInput } from "#/shared/schemas/task.schema";
import { tasksKeys } from "../keys";

export function useAssignTaskMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: AssignTaskInput) => assignTaskFn({ data: input }),
		meta: {
			successToast: "อัปเดตผู้รับผิดชอบงานสำเร็จ",
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
