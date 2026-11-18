import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { signUpWithEmailUseCase } from "#/server/composition/auth.container";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { AuthUserDto } from "#/shared/schemas/auth.schema";
import { signUpInputSchema } from "#/shared/schemas/auth.schema";

export const signUpFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware])
	.validator(signUpInputSchema)
	.handler(async ({ data }): Promise<AuthUserDto> => {
		const headers = new Headers(getRequestHeaders());
		return signUpWithEmailUseCase.execute({
			payload: data,
			headers,
		});
	});
