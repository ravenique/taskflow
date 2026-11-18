import { GetCurrentSessionUseCase } from "#/server/application/auth/get-current-session.use-case";
import { HandleAuthRequestUseCase } from "#/server/application/auth/handle-auth-request.use-case";
import { SignInWithEmailUseCase } from "#/server/application/auth/sign-in-with-email.use-case";
import { SignOutUseCase } from "#/server/application/auth/sign-out.use-case";
import { SignUpWithEmailUseCase } from "#/server/application/auth/sign-up-with-email.use-case";
import { BetterAuthGateway } from "#/server/infrastructure/auth/better-auth.gateway";

const authGateway = new BetterAuthGateway();

export const getCurrentSessionUseCase = new GetCurrentSessionUseCase(
	authGateway,
);
export const signInWithEmailUseCase = new SignInWithEmailUseCase(authGateway);
export const signUpWithEmailUseCase = new SignUpWithEmailUseCase(authGateway);
export const signOutUseCase = new SignOutUseCase(authGateway);
export const handleAuthRequestUseCase = new HandleAuthRequestUseCase(
	authGateway,
);
