import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getCurrentSessionUseCase } from "#/server/composition/auth.container";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { CurrentSessionResultDto } from "#/shared/schemas/auth.schema";

export const getSessionFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware])
	.handler(async (): Promise<CurrentSessionResultDto> => {
		const headers = new Headers(getRequestHeaders());
		return getCurrentSessionUseCase.execute({ headers });
	});
