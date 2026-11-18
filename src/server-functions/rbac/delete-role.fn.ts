import { createServerFn } from "@tanstack/react-start";
import { deleteRoleUseCase } from "#/server/composition/rbac.container";
import { requireSystemPermission } from "#/server-functions/middlewares/permission.middleware";
import { deleteRoleInputSchema } from "#/shared/schemas/rbac.schema";

export const deleteRoleFn = createServerFn({ method: "POST" })
	.middleware([requireSystemPermission("role:manage")])
	.validator(deleteRoleInputSchema)
	.handler(async ({ data }): Promise<{ success: true }> => {
		await deleteRoleUseCase.execute({ payload: data });
		return { success: true };
	});
