import { createServerFn } from "@tanstack/react-start";
import { updateRolePermissionsUseCase } from "#/server/composition/rbac.container";
import { requireSystemPermission } from "#/server-functions/middlewares/permission.middleware";
import type { RoleDto } from "#/shared/schemas/rbac.schema";
import { updateRolePermissionsInputSchema } from "#/shared/schemas/rbac.schema";

export const updateRolePermissionsFn = createServerFn({ method: "POST" })
	.middleware([requireSystemPermission("role:manage")])
	.validator(updateRolePermissionsInputSchema)
	.handler(async ({ data }): Promise<RoleDto> => {
		return updateRolePermissionsUseCase.execute({ payload: data });
	});
