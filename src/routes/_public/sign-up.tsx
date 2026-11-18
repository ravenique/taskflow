import { createFileRoute } from "@tanstack/react-router";
import { SignUpScreen } from "#/client/features/auth/screens/sign-up.screen";

export const Route = createFileRoute("/_public/sign-up")({
	component: SignUpScreen,
});
