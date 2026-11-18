import { createServerFn } from "@tanstack/react-start";
import { listRolesUseCase } from "#/server/composition/rbac.container";
import { requireSystemPermission } from "#/server-functions/middlewares/permission.middleware";
import type { ListRolesResultDto } from "#/shared/schemas/rbac.schema";

export const listRolesFn = createServerFn({ method: "GET" })
	.middleware([requireSystemPermission("role:read")])
	.handler(async (): Promise<ListRolesResultDto> => {
		return listRolesUseCase.execute();
	});
