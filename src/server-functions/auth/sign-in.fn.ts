import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { signInWithEmailUseCase } from "#/server/composition/auth.container";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { AuthUserDto } from "#/shared/schemas/auth.schema";
import { signInInputSchema } from "#/shared/schemas/auth.schema";

export const signInFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware])
	.validator(signInInputSchema)
	.handler(async ({ data }): Promise<AuthUserDto> => {
		const headers = new Headers(getRequestHeaders());
		return signInWithEmailUseCase.execute({
			payload: data,
			headers,
		});
	});
