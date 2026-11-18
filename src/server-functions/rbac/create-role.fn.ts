import { createServerFn } from "@tanstack/react-start";
import { createRoleUseCase } from "#/server/composition/rbac.container";
import { requireSystemPermission } from "#/server-functions/middlewares/permission.middleware";
import type { RoleDto } from "#/shared/schemas/rbac.schema";
import { createRoleInputSchema } from "#/shared/schemas/rbac.schema";

export const createRoleFn = createServerFn({ method: "POST" })
	.middleware([requireSystemPermission("role:manage")])
	.validator(createRoleInputSchema)
	.handler(async ({ data }): Promise<RoleDto> => {
		return createRoleUseCase.execute({ payload: data });
	});
