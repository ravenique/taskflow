import { handleAuthRequestUseCase } from "#/server/composition/auth.container";

export function handleAuthRequest(request: Request): Promise<Response> {
	return handleAuthRequestUseCase.execute({ request });
}
