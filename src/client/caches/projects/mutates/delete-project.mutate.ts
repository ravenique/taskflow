import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceKeys } from "#/client/caches/workspace/keys";
import { deleteProjectFn } from "#/server-functions/projects/delete-project.fn";
import type { ProjectActionInput } from "#/shared/schemas/project.schema";
import { projectsKeys } from "../keys";

export function useDeleteProjectMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: ProjectActionInput) => deleteProjectFn({ data: input }),
		meta: {
			successToast: "ลบโครงการถาวรเรียบร้อยแล้ว",
		},
		onSuccess: async (_data, variables) => {
			queryClient.removeQueries({
				queryKey: projectsKeys.detail(variables.projectId),
			});
			queryClient.removeQueries({
				queryKey: projectsKeys.members(variables.projectId),
			});
			queryClient.removeQueries({
				queryKey: projectsKeys.activity(variables.projectId),
			});
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: projectsKeys.all }),
				queryClient.invalidateQueries({ queryKey: workspaceKeys.all }),
			]);
		},
	});
}
