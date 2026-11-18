import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { DomainError } from "#/server/domain/common/errors";

const DOMAIN_ERROR_HTTP_STATUS = {
	DOMAIN_VALIDATION_ERROR: 400,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INVALID_STATE_TRANSITION: 422,
} as const;

export const domainErrorMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	try {
		return await next();
	} catch (error) {
		if (error instanceof DomainError) {
			setResponseStatus(DOMAIN_ERROR_HTTP_STATUS[error.code]);
		}
		throw error;
	}
});
