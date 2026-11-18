import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signInFn } from "#/server-functions/auth/sign-in.fn";
import type { SignInInput } from "#/shared/schemas/auth.schema";
import { sessionQueryOptions } from "../queries/session.query";

export function useSignInMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: SignInInput) => signInFn({ data: input }),
		meta: {
			successToast: "เข้าสู่ระบบสำเร็จ",
		},
		onSuccess: async () => {
			await queryClient.query({
				...sessionQueryOptions(),
				staleTime: 0,
			});
		},
	});
}
