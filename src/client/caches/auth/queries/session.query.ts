import { queryOptions } from "@tanstack/react-query";
import { getSessionFn } from "#/server-functions/auth/get-session.fn";
import { authKeys } from "../keys";

export function sessionQueryOptions() {
	return queryOptions({
		queryKey: authKeys.session(),
		queryFn: () => getSessionFn(),
		staleTime: 60_000,
	});
}
