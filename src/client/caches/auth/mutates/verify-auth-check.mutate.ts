import { useMutation } from "@tanstack/react-query";
import { getAuthCheckFn } from "#/server-functions/auth/get-auth-check.fn";

export function useVerifyAuthCheckMutation() {
	return useMutation({
		mutationFn: () => getAuthCheckFn(),
		meta: {
			successToast: "ยืนยันตัวตนสำเร็จ",
		},
	});
}
