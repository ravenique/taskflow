import { useNavigate, useRouter } from "@tanstack/react-router";
import { useSignOutMutation } from "#/client/caches/auth/mutates/sign-out.mutate";
import { useSession } from "./use-session";

function computeInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return "U";
	}

	if (parts.length === 1) {
		return parts[0].slice(0, 2).toUpperCase();
	}

	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function useAuthHeaderControls() {
	const router = useRouter();
	const navigate = useNavigate();
	const { session, isPending } = useSession();
	const signOutMutation = useSignOutMutation();

	const user = session?.user ?? null;
	const initials = user ? computeInitials(user.name) : "";
	const primaryRole = user?.systemRoles[0] ?? "member";

	const handleGoWorkspace = async () => {
		await navigate({ to: "/" });
	};

	const handleSignOut = async () => {
		await signOutMutation.mutateAsync();
		await router.invalidate();
		await navigate({ to: "/sign-in" });
	};

	return {
		isPending,
		user,
		initials,
		primaryRole,
		isSigningOut: signOutMutation.isPending,
		handleGoWorkspace,
		handleSignOut,
	};
}
