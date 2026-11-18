import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceKeys } from "#/client/caches/workspace/keys";
import { createProjectFn } from "#/server-functions/projects/create-project.fn";
import type { CreateProjectInput } from "#/shared/schemas/project.schema";
import { projectsKeys } from "../keys";

export function useCreateProjectMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateProjectInput) => createProjectFn({ data: input }),
		meta: {
			successToast: "สร้างโครงการใหม่สำเร็จ",
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: projectsKeys.all }),
				queryClient.invalidateQueries({ queryKey: workspaceKeys.all }),
			]);
		},
	});
}
