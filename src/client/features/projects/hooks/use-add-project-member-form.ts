import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useAddProjectMemberMutation } from "#/client/caches/projects/mutates/add-project-member.mutate";
import { projectMembersQueryOptions } from "#/client/caches/projects/queries/project-members.query";
import type { AppFormSelectOption } from "#/client/shared/components/app-form";
import { useAppForm } from "#/client/shared/components/app-form";
import { addProjectMemberInputSchema } from "#/shared/schemas/project.schema";
import { useProjectDetail } from "./use-project-detail";

export function useAddProjectMemberForm() {
	const { projectId, isArchived, can } = useProjectDetail();
	const { data } = useQuery({
		...projectMembersQueryOptions(projectId),
		enabled: Boolean(projectId),
	});
	const addMutation = useAddProjectMemberMutation();

	const canManageMembers = can("project:manage_members");

	const userOptions: AppFormSelectOption[] = useMemo(
		() =>
			(data?.invitableUsers ?? []).map((invitableUser) => ({
				label: `${invitableUser.name} (${invitableUser.email})`,
				value: invitableUser.id,
			})),
		[data?.invitableUsers],
	);

	const roleOptions: AppFormSelectOption[] = useMemo(
		() =>
			(data?.availableRoles ?? []).map((role) => ({
				label: `${role.name} (${role.permissions.length} permissions)`,
				value: role.id,
			})),
		[data?.availableRoles],
	);

	const form = useAppForm({
		defaultValues: {
			projectId,
			userId: "",
			roleId: "",
		},
		validators: {
			onSubmit: addProjectMemberInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await addMutation.mutateAsync(value);
				form.reset({
					projectId,
					userId: "",
					roleId: "",
				});
			} catch {
				// Error toast is centrally handled by MutationCache in client/caches/global.ts
				return;
			}
		},
	});

	useEffect(() => {
		form.setFieldValue("projectId", projectId);
	}, [projectId, form]);

	return {
		canManageMembers,
		isArchived,
		userOptions,
		roleOptions,
		hasInvitableUsers: userOptions.length > 0,
		form,
	};
}
