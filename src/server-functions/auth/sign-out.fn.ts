import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { signOutUseCase } from "#/server/composition/auth.container";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";

export const signOutFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware])
	.handler(async (): Promise<{ success: true }> => {
		const headers = new Headers(getRequestHeaders());
		await signOutUseCase.execute({ headers });
		return { success: true };
	});
