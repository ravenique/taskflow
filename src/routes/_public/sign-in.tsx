import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SignInScreen } from "#/client/features/auth/screens/sign-in.screen";

const signInSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/_public/sign-in")({
	validateSearch: signInSearchSchema,
	component: SignInScreen,
});
