import { createServerFn } from "@tanstack/react-start";
import { listUsersUseCase } from "#/server/composition/users.container";
import { requireSystemPermission } from "#/server-functions/middlewares/permission.middleware";
import type { AdminUserDto } from "#/shared/schemas/user.schema";
import { listUsersInputSchema } from "#/shared/schemas/user.schema";

export const listUsersFn = createServerFn({ method: "GET" })
	.middleware([requireSystemPermission("user:read")])
	.validator(listUsersInputSchema)
	.handler(async ({ data }): Promise<AdminUserDto[]> => {
		return listUsersUseCase.execute({ payload: data });
	});
