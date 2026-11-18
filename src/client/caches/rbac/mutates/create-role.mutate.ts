import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoleFn } from "#/server-functions/rbac/create-role.fn";
import type { CreateRoleInput } from "#/shared/schemas/rbac.schema";
import { rbacKeys } from "../keys";

export function useCreateRoleMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateRoleInput) => createRoleFn({ data: input }),
		meta: {
			successToast: "สร้างบทบาทใหม่สำเร็จ",
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: rbacKeys.all });
		},
	});
}
