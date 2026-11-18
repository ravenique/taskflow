import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useChangeProjectMemberRoleMutation } from "#/client/caches/projects/mutates/change-project-member-role.mutate";
import { projectMembersQueryOptions } from "#/client/caches/projects/queries/project-members.query";
import type { AppFormSelectOption } from "#/client/shared/components/app-form";
import { useAppForm } from "#/client/shared/components/app-form";
import { changeProjectMemberRoleInputSchema } from "#/shared/schemas/project.schema";
import { useProjectMembersContext } from "../contexts/project-members.context";
import { useProjectId } from "./use-project-id";

export function useChangeMemberRoleForm() {
	const projectId = useProjectId();
	const { changingMember, closeChangeRoleDialog } = useProjectMembersContext();
	const { data } = useQuery({
		...projectMembersQueryOptions(projectId),
		enabled: Boolean(projectId),
	});
	const changeMutation = useChangeProjectMemberRoleMutation();

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
			memberId: changingMember?.id ?? "",
			roleId: changingMember?.roleId ?? "",
		},
		validators: {
			onSubmit: changeProjectMemberRoleInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await changeMutation.mutateAsync(value);
				closeChangeRoleDialog();
			} catch {
				// Error toast is centrally handled by MutationCache in client/caches/global.ts
				return;
			}
		},
	});

	useEffect(() => {
		if (!changingMember) {
			return;
		}
		form.reset({
			projectId: changingMember.projectId,
			memberId: changingMember.id,
			roleId: changingMember.roleId,
		});
	}, [changingMember, form]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeChangeRoleDialog();
		}
	};

	return {
		changingMember,
		roleOptions,
		handleOpenChange,
		form,
	};
}
