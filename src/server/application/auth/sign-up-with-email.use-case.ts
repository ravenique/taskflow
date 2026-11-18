import type { AuthUserDto, SignUpInput } from "#/shared/schemas/auth.schema";
import type { IAuthGateway } from "./auth-gateway.interface";

export interface SignUpWithEmailUseCaseInput {
	payload: SignUpInput;
	headers: Headers;
}

export class SignUpWithEmailUseCase {
	constructor(private readonly authGateway: IAuthGateway) {}

	async execute(input: SignUpWithEmailUseCaseInput): Promise<AuthUserDto> {
		return this.authGateway.signUpWithEmail(input.payload, input.headers);
	}
}
