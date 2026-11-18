import { useEffect } from "react";
import { z } from "zod";
import { useUpdateTaskMutation } from "#/client/caches/tasks/mutates/update-task.mutate";
import { useAppForm } from "#/client/shared/components/app-form";
import type { TaskPriority } from "#/shared/schemas/task.schema";
import {
	taskDescriptionSchema,
	taskDueDateInputSchema,
	taskPrioritySchema,
	taskTitleSchema,
} from "#/shared/schemas/task.schema";
import { TASK_PRIORITY_OPTIONS, toDateInputValue } from "../models/task-ui";
import { useTaskDetail } from "./use-task-detail";

const editTaskFormSchema = z.object({
	title: taskTitleSchema,
	description: taskDescriptionSchema,
	priority: taskPrioritySchema,
	dueDate: taskDueDateInputSchema,
});

export function useTaskEditForm() {
	const { projectId, task, isArchived, canUpdateTask } = useTaskDetail();
	const updateMutation = useUpdateTaskMutation();

	const form = useAppForm({
		defaultValues: {
			title: task?.title ?? "",
			description: task?.description ?? "",
			priority: (task?.priority ?? "medium") as TaskPriority,
			dueDate: toDateInputValue(task?.dueDate ?? null),
		},
		validators: {
			onBlur: editTaskFormSchema,
			onSubmit: editTaskFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!projectId || !task) {
				return;
			}
			const dueDate = value.dueDate.trim() === "" ? null : value.dueDate.trim();
			try {
				await updateMutation.mutateAsync({
					projectId,
					taskId: task.id,
					title: value.title,
					description: value.description,
					priority: value.priority,
					dueDate,
				});
			} catch {
				// Error toast is centrally handled by MutationCache in client/caches/global.ts
				return;
			}
		},
	});

	useEffect(() => {
		if (!task) {
			return;
		}
		form.reset({
			title: task.title,
			description: task.description,
			priority: task.priority,
			dueDate: toDateInputValue(task.dueDate),
		});
	}, [task, form]);

	return {
		task,
		canUpdateTask,
		isArchived,
		priorityOptions: TASK_PRIORITY_OPTIONS,
		form,
	};
}
