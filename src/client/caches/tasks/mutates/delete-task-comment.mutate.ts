import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsKeys } from "#/client/caches/projects/keys";
import { deleteTaskCommentFn } from "#/server-functions/tasks/delete-task-comment.fn";
import type { DeleteTaskCommentInput } from "#/shared/schemas/task.schema";
import { tasksKeys } from "../keys";

export function useDeleteTaskCommentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: DeleteTaskCommentInput) =>
			deleteTaskCommentFn({ data: input }),
		meta: {
			successToast: "ลบความคิดเห็นแล้ว",
		},
		onSuccess: async (_data, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: tasksKeys.project(variables.projectId),
				}),
				queryClient.invalidateQueries({
					queryKey: projectsKeys.activity(variables.projectId),
				}),
			]);
		},
	});
}
