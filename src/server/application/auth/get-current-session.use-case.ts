import type { CurrentSessionResultDto } from "#/shared/schemas/auth.schema";
import type { IAuthGateway } from "./auth-gateway.interface";

export interface GetCurrentSessionUseCaseInput {
	headers: Headers;
}

export class GetCurrentSessionUseCase {
	constructor(private readonly authGateway: IAuthGateway) {}

	async execute(
		input: GetCurrentSessionUseCaseInput,
	): Promise<CurrentSessionResultDto> {
		return this.authGateway.getSession(input.headers);
	}
}
