import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOutFn } from "#/server-functions/auth/sign-out.fn";
import { authKeys } from "../keys";

export function useSignOutMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => signOutFn(),
		meta: {
			successToast: "ออกจากระบบแล้ว",
		},
		onSuccess: () => {
			queryClient.clear();
			queryClient.setQueryData(authKeys.session(), null);
		},
	});
}
