import { createMiddleware } from "@tanstack/react-start";
import {
	getRequestHeaders,
	setResponseStatus,
} from "@tanstack/react-start/server";
import { getCurrentSessionUseCase } from "#/server/composition/auth.container";

export const requireAuthMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	const headers = new Headers(getRequestHeaders());
	const authSession = await getCurrentSessionUseCase.execute({ headers });

	if (!authSession) {
		setResponseStatus(401);
		throw new Error("กรุณาลงชื่อเข้าใช้ก่อนดำเนินการ");
	}

	return next({
		context: {
			authSession,
		},
	});
});
