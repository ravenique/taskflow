import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "#/client/caches/auth/keys";
import { usersKeys } from "#/client/caches/users/keys";
import { deleteRoleFn } from "#/server-functions/rbac/delete-role.fn";
import type { DeleteRoleInput } from "#/shared/schemas/rbac.schema";
import { rbacKeys } from "../keys";

export function useDeleteRoleMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: DeleteRoleInput) => deleteRoleFn({ data: input }),
		meta: {
			successToast: "ลบบทบาทสำเร็จ",
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: rbacKeys.all }),
				queryClient.invalidateQueries({ queryKey: usersKeys.all }),
				queryClient.invalidateQueries({ queryKey: authKeys.session() }),
			]);
		},
	});
}
