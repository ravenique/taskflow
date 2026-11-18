import { createServerFn } from "@tanstack/react-start";
import { assignUserSystemRolesUseCase } from "#/server/composition/users.container";
import { requireSystemPermission } from "#/server-functions/middlewares/permission.middleware";
import { assignUserSystemRolesInputSchema } from "#/shared/schemas/user.schema";

export const assignUserRolesFn = createServerFn({ method: "POST" })
	.middleware([requireSystemPermission("user:assign_role")])
	.validator(assignUserSystemRolesInputSchema)
	.handler(async ({ context, data }): Promise<{ success: true }> => {
		await assignUserSystemRolesUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
		return { success: true };
	});
