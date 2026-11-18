import { queryOptions } from "@tanstack/react-query";
import { getMyPermissionsFn } from "#/server-functions/rbac/get-my-permissions.fn";
import { rbacKeys } from "../keys";

export function myPermissionsQueryOptions() {
	return queryOptions({
		queryKey: rbacKeys.myPermissions(),
		queryFn: () => getMyPermissionsFn(),
		staleTime: 30_000,
	});
}
