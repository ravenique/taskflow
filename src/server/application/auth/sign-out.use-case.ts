import type { IAuthGateway } from "./auth-gateway.interface";

export interface SignOutUseCaseInput {
	headers: Headers;
}

export class SignOutUseCase {
	constructor(private readonly authGateway: IAuthGateway) {}

	async execute(input: SignOutUseCaseInput): Promise<void> {
		return this.authGateway.signOut(input.headers);
	}
}
