import { queryOptions } from "@tanstack/react-query";
import { listRolesFn } from "#/server-functions/rbac/list-roles.fn";
import { rbacKeys } from "../keys";

export function rolesListQueryOptions() {
	return queryOptions({
		queryKey: rbacKeys.roles(),
		queryFn: () => listRolesFn(),
		staleTime: 30_000,
	});
}
