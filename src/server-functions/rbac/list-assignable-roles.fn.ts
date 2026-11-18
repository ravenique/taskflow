import { createServerFn } from "@tanstack/react-start";
import { listAssignableRolesUseCase } from "#/server/composition/rbac.container";
import { requireSystemPermission } from "#/server-functions/middlewares/permission.middleware";
import type { RoleDto } from "#/shared/schemas/rbac.schema";

export const listAssignableRolesFn = createServerFn({ method: "GET" })
	.middleware([requireSystemPermission("user:assign_role")])
	.handler(async (): Promise<RoleDto[]> => {
		return listAssignableRolesUseCase.execute();
	});
