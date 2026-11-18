import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { useSignInMutation } from "#/client/caches/auth/mutates/sign-in.mutate";
import { useAppForm } from "#/client/shared/components/app-form";
import { signInInputSchema } from "#/shared/schemas/auth.schema";

function sanitizeRedirectTarget(target: unknown): string {
	if (typeof target !== "string") {
		return "/";
	}
	if (!target.startsWith("/") || target.startsWith("//")) {
		return "/";
	}
	return target;
}

export function useSignInForm() {
	const router = useRouter();
	const navigate = useNavigate();
	const search = useSearch({ strict: false });
	const signInMutation = useSignInMutation();

	const rawRedirect = "redirect" in search ? search.redirect : undefined;
	const redirectTarget = sanitizeRedirectTarget(rawRedirect);

	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onBlur: signInInputSchema,
			onSubmit: signInInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await signInMutation.mutateAsync(value);
				await router.invalidate();
				if (redirectTarget === "/") {
					await navigate({ to: "/" });
					return;
				}
				await navigate({ href: redirectTarget });
			} catch {
				return;
			}
		},
	});

	return { form };
}
