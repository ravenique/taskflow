import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signUpFn } from "#/server-functions/auth/sign-up.fn";
import type { SignUpInput } from "#/shared/schemas/auth.schema";
import { sessionQueryOptions } from "../queries/session.query";

export function useSignUpMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: SignUpInput) => signUpFn({ data: input }),
		meta: {
			successToast: "สร้างบัญชีผู้ใช้งานสำเร็จ",
		},
		onSuccess: async () => {
			await queryClient.query({
				...sessionQueryOptions(),
				staleTime: 0,
			});
		},
	});
}
