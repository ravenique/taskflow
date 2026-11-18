import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "#/client/caches/auth/queries/session.query";

export function useSession() {
	const { data, isPending } = useQuery(sessionQueryOptions());

	return {
		session: data ?? null,
		isPending,
		isAuthenticated: Boolean(data),
	};
}
