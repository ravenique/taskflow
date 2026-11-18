import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "#/client/caches/auth/keys";
import { usersKeys } from "#/client/caches/users/keys";
import { updateRolePermissionsFn } from "#/server-functions/rbac/update-role-permissions.fn";
import type { UpdateRolePermissionsInput } from "#/shared/schemas/rbac.schema";
import { rbacKeys } from "../keys";

export function useUpdateRolePermissionsMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateRolePermissionsInput) =>
			updateRolePermissionsFn({ data: input }),
		meta: {
			successToast: "บันทึกสิทธิ์ของบทบาทสำเร็จ",
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
