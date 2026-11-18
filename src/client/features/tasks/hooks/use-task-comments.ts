import { useMemo, useState } from "react";
import { z } from "zod";
import { useAddTaskCommentMutation } from "#/client/caches/tasks/mutates/add-task-comment.mutate";
import { useDeleteTaskCommentMutation } from "#/client/caches/tasks/mutates/delete-task-comment.mutate";
import { useAppForm } from "#/client/shared/components/app-form";
import { taskCommentBodySchema } from "#/shared/schemas/task.schema";
import { useTaskDetail } from "./use-task-detail";

const addCommentFormSchema = z.object({
	body: taskCommentBodySchema,
});

export function useTaskComments() {
	const {
		projectId,
		task,
		isArchived,
		currentUserId,
		canCreateComment,
		canDeleteAnyComment,
	} = useTaskDetail();
	const addCommentMutation = useAddTaskCommentMutation();
	const deleteCommentMutation = useDeleteTaskCommentMutation();
	const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
		null,
	);

	const form = useAppForm({
		defaultValues: {
			body: "",
		},
		validators: {
			onSubmit: addCommentFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!projectId || !task) {
				return;
			}
			try {
				await addCommentMutation.mutateAsync({
					projectId,
					taskId: task.id,
					body: value.body,
				});
				form.reset();
			} catch {
				// Error toast is centrally handled by MutationCache in client/caches/global.ts
				return;
			}
		},
	});

	const comments = useMemo(
		() =>
			(task?.comments ?? []).map((comment) => ({
				id: comment.id,
				authorName: comment.author.name,
				authorEmail: comment.author.email,
				body: comment.body,
				createdAtLabel: new Date(comment.createdAt).toLocaleString(),
				canDelete:
					!isArchived &&
					(comment.author.id === currentUserId || canDeleteAnyComment),
			})),
		[task?.comments, currentUserId, canDeleteAnyComment, isArchived],
	);

	const handleDeleteComment = async (commentId: string) => {
		if (!projectId || !task) {
			return;
		}
		setDeletingCommentId(commentId);
		try {
			await deleteCommentMutation.mutateAsync({
				projectId,
				taskId: task.id,
				commentId,
			});
		} catch {
			// Error toast is centrally handled by MutationCache in client/caches/global.ts
			return;
		} finally {
			setDeletingCommentId(null);
		}
	};

	return {
		comments,
		canCreateComment,
		isArchived,
		deletingCommentId,
		handleDeleteComment,
		form,
	};
}
