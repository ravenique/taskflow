import type {
	AuthUserDto,
	CurrentSessionResultDto,
	SignInInput,
	SignUpInput,
} from "#/shared/schemas/auth.schema";

export interface IAuthGateway {
	getSession(headers: Headers): Promise<CurrentSessionResultDto>;
	signInWithEmail(input: SignInInput, headers: Headers): Promise<AuthUserDto>;
	signUpWithEmail(input: SignUpInput, headers: Headers): Promise<AuthUserDto>;
	signOut(headers: Headers): Promise<void>;
	handleHttpRequest(request: Request): Promise<Response>;
}
