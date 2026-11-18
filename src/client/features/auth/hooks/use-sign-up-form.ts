import { useNavigate, useRouter } from "@tanstack/react-router";
import { useSignUpMutation } from "#/client/caches/auth/mutates/sign-up.mutate";
import { useAppForm } from "#/client/shared/components/app-form";
import { signUpFormSchema } from "../models/sign-up-form.schema";

export function useSignUpForm() {
	const router = useRouter();
	const navigate = useNavigate();
	const signUpMutation = useSignUpMutation();

	const form = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validators: {
			onBlur: signUpFormSchema,
			onSubmit: signUpFormSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await signUpMutation.mutateAsync({
					name: value.name,
					email: value.email,
					password: value.password,
				});
				await router.invalidate();
				await navigate({ to: "/" });
			} catch {
				return;
			}
		},
	});

	return { form };
}
