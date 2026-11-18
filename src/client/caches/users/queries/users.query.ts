import { queryOptions } from "@tanstack/react-query";
import { listUsersFn } from "#/server-functions/users/list-users.fn";
import { usersKeys } from "../keys";

export function adminUsersQueryOptions(search = "") {
	const normalizedSearch = search.trim();

	return queryOptions({
		queryKey: usersKeys.list(normalizedSearch),
		queryFn: () =>
			listUsersFn({
				data: {
					search: normalizedSearch || undefined,
				},
			}),
		staleTime: 30_000,
	});
}
