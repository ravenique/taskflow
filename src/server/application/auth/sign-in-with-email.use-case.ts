import type { AuthUserDto, SignInInput } from "#/shared/schemas/auth.schema";
import type { IAuthGateway } from "./auth-gateway.interface";

export interface SignInWithEmailUseCaseInput {
	payload: SignInInput;
	headers: Headers;
}

export class SignInWithEmailUseCase {
	constructor(private readonly authGateway: IAuthGateway) {}

	async execute(input: SignInWithEmailUseCaseInput): Promise<AuthUserDto> {
		return this.authGateway.signInWithEmail(input.payload, input.headers);
	}
}
