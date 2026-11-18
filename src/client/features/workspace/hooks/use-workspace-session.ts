import { useQuery } from "@tanstack/react-query";
import { useVerifyAuthCheckMutation } from "#/client/caches/auth/mutates/verify-auth-check.mutate";
import { sessionQueryOptions } from "#/client/caches/auth/queries/session.query";

export function useWorkspaceSession() {
	const { data: session } = useQuery(sessionQueryOptions());
	const verifyAuthMutation = useVerifyAuthCheckMutation();

	const handleVerifyAuthCheck = async () => {
		try {
			await verifyAuthMutation.mutateAsync();
		} catch {
			return;
		}
	};

	return {
		user: session?.user ?? null,
		sessionExpiresAt: session?.session.expiresAt ?? null,
		authCheckResult: verifyAuthMutation.data ?? null,
		isCheckingAuth: verifyAuthMutation.isPending,
		handleVerifyAuthCheck,
	};
}
