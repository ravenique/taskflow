import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { z } from "zod";
import { projectMembersQueryOptions } from "#/client/caches/projects/queries/project-members.query";
import { useAssignTaskMutation } from "#/client/caches/tasks/mutates/assign-task.mutate";
import { useAppForm } from "#/client/shared/components/app-form";
import { UNASSIGNED_ASSIGNEE_VALUE } from "../models/task-ui";
import { useTaskDetail } from "./use-task-detail";

const assignTaskFormSchema = z.object({
	assigneeId: z.string().min(1),
});

export function useTaskAssigneeForm() {
	const { projectId, task, isArchived, canAssignTask } = useTaskDetail();
	const assignMutation = useAssignTaskMutation();

	const { data: membersData } = useQuery({
		...projectMembersQueryOptions(projectId),
		enabled: Boolean(projectId),
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
			assigneeId: task?.assignee?.id ?? UNASSIGNED_ASSIGNEE_VALUE,
		},
		validators: {
			onSubmit: assignTaskFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!projectId || !task) {
				return;
			}
			const nextAssigneeId =
				value.assigneeId === UNASSIGNED_ASSIGNEE_VALUE
					? null
					: value.assigneeId;

			try {
				await assignMutation.mutateAsync({
					projectId,
					taskId: task.id,
					assigneeId: nextAssigneeId,
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
			assigneeId: task.assignee?.id ?? UNASSIGNED_ASSIGNEE_VALUE,
		});
	}, [task, form]);

	return {
		task,
		canAssignTask,
		isArchived,
		assigneeOptions,
		form,
	};
}
