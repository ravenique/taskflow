import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeProjectMemberRoleFn } from "#/server-functions/projects/change-project-member-role.fn";
import type { ChangeProjectMemberRoleInput } from "#/shared/schemas/project.schema";
import { projectsKeys } from "../keys";

export function useChangeProjectMemberRoleMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: ChangeProjectMemberRoleInput) =>
			changeProjectMemberRoleFn({ data: input }),
		meta: {
			successToast: "เปลี่ยนบทบาทของสมาชิกสำเร็จ",
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: projectsKeys.all });
		},
	});
}
