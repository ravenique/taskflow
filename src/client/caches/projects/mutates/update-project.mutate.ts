import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProjectFn } from "#/server-functions/projects/update-project.fn";
import type { UpdateProjectInput } from "#/shared/schemas/project.schema";
import { projectsKeys } from "../keys";

export function useUpdateProjectMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateProjectInput) => updateProjectFn({ data: input }),
		meta: { successToast: "บันทึกการแก้ไขโครงการสำเร็จ" },
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: projectsKeys.all });
		},
	});
}
