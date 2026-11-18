import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { projectMembersQueryOptions } from "#/client/caches/projects/queries/project-members.query";
import { useCreateTaskMutation } from "#/client/caches/tasks/mutates/create-task.mutate";
import { useProjectDetail } from "#/client/features/projects/hooks/use-project-detail";
import { useAppForm } from "#/client/shared/components/app-form";
import type { TaskPriority } from "#/shared/schemas/task.schema";
import {
	taskDescriptionSchema,
	taskDueDateInputSchema,
	taskPrioritySchema,
	taskTitleSchema,
} from "#/shared/schemas/task.schema";
import { useTasksListContext } from "../contexts/tasks-list.context";
import {
	TASK_PRIORITY_OPTIONS,
	UNASSIGNED_ASSIGNEE_VALUE,
} from "../models/task-ui";

const createTaskFormSchema = z.object({
	title: taskTitleSchema,
	description: taskDescriptionSchema,
	priority: taskPrioritySchema,
	assigneeId: z.string(),
	dueDate: taskDueDateInputSchema,
});

export function useCreateTaskForm() {
	const { projectId, can } = useProjectDetail();
	const { isCreateDialogOpen, closeCreateDialog } = useTasksListContext();
	const createMutation = useCreateTaskMutation();

	const canAssignTask = can("task:assign");

	const { data: membersData } = useQuery({
		...projectMembersQueryOptions(projectId),
		enabled: Boolean(projectId) && canAssignTask,
	});

	const assigneeOptions = useMemo(() => {
		const members = (membersData?.members ?? []).map((member) => ({
			label: `${member.userName} (${member.roleName})`,
			value: member.userId,
		}));

		return [
			{
				label: "ยังไม่ระบุผู้รับผิดชอบ (Unassigned)",
				value: UNASSIGNED_ASSIGNEE_VALUE,
			},
			...members,
		];
	}, [membersData]);

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			priority: "medium" as TaskPriority,
			assigneeId: UNASSIGNED_ASSIGNEE_VALUE,
			dueDate: "",
		},
		validators: {
			onBlur: createTaskFormSchema,
			onSubmit: createTaskFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!projectId) {
				return;
			}
			const assigneeId =
				!canAssignTask ||
				value.assigneeId === UNASSIGNED_ASSIGNEE_VALUE ||
				value.assigneeId.trim() === ""
					? null
					: value.assigneeId;
			const dueDate = value.dueDate.trim() === "" ? null : value.dueDate.trim();

			try {
				await createMutation.mutateAsync({
					projectId,
					title: value.title,
					description: value.description,
					priority: value.priority,
					assigneeId,
					dueDate,
				});
				form.reset();
				closeCreateDialog();
			} catch {
				// Error toast is centrally handled by MutationCache in client/caches/global.ts
				return;
			}
		},
	});

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			form.reset();
			closeCreateDialog();
		}
	};

	return {
		isOpen: isCreateDialogOpen,
		canAssignTask,
		priorityOptions: TASK_PRIORITY_OPTIONS,
		assigneeOptions,
		handleOpenChange,
		form,
	};
}
