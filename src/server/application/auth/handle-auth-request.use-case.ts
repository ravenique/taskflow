import type { IAuthGateway } from "./auth-gateway.interface";

export interface HandleAuthRequestUseCaseInput {
	request: Request;
}

export class HandleAuthRequestUseCase {
	constructor(private readonly authGateway: IAuthGateway) {}

	async execute(input: HandleAuthRequestUseCaseInput): Promise<Response> {
		return this.authGateway.handleHttpRequest(input.request);
	}
}
