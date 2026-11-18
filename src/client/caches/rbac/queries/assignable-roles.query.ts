import { queryOptions } from "@tanstack/react-query";
import { listAssignableRolesFn } from "#/server-functions/rbac/list-assignable-roles.fn";
import { rbacKeys } from "../keys";

export function assignableRolesQueryOptions() {
	return queryOptions({
		queryKey: rbacKeys.assignableRoles(),
		queryFn: () => listAssignableRolesFn(),
		staleTime: 30_000,
	});
}
