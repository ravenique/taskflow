import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProjectMemberFn } from "#/server-functions/projects/add-project-member.fn";
import type { AddProjectMemberInput } from "#/shared/schemas/project.schema";
import { projectsKeys } from "../keys";

export function useAddProjectMemberMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: AddProjectMemberInput) =>
			addProjectMemberFn({ data: input }),
		meta: {
			successToast: "เพิ่มสมาชิกเข้าโครงการสำเร็จ",
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: projectsKeys.all });
		},
	});
}
