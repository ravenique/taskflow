import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeProjectMemberFn } from "#/server-functions/projects/remove-project-member.fn";
import type { RemoveProjectMemberInput } from "#/shared/schemas/project.schema";
import { projectsKeys } from "../keys";

export function useRemoveProjectMemberMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: RemoveProjectMemberInput) =>
			removeProjectMemberFn({ data: input }),
		meta: {
			successToast: "นำสมาชิกออกจากโครงการแล้ว",
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: projectsKeys.all });
		},
	});
}
