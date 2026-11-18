import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsKeys } from "#/client/caches/projects/keys";
import { addTaskCommentFn } from "#/server-functions/tasks/add-task-comment.fn";
import type { AddTaskCommentInput } from "#/shared/schemas/task.schema";
import { tasksKeys } from "../keys";

export function useAddTaskCommentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: AddTaskCommentInput) =>
			addTaskCommentFn({ data: input }),
		meta: {
			successToast: "เพิ่มความคิดเห็นสำเร็จ",
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
