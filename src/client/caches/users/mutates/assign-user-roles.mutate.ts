import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "#/client/caches/auth/keys";
import { rbacKeys } from "#/client/caches/rbac/keys";
import { assignUserRolesFn } from "#/server-functions/users/assign-user-roles.fn";
import type { AssignUserSystemRolesInput } from "#/shared/schemas/user.schema";
import { usersKeys } from "../keys";

export function useAssignUserRolesMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: AssignUserSystemRolesInput) =>
			assignUserRolesFn({ data: input }),
		meta: {
			successToast: "กำหนดบทบาทระบบให้ผู้ใช้งานสำเร็จ",
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: usersKeys.all }),
				queryClient.invalidateQueries({ queryKey: rbacKeys.myPermissions() }),
				queryClient.invalidateQueries({ queryKey: authKeys.session() }),
			]);
		},
	});
}
