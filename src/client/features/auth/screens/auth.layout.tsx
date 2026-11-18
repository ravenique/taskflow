import { Outlet } from "@tanstack/react-router";
import { AppShellMain } from "#/client/shared/components/app-shell";

export function AuthLayout() {
	return (
		<AppShellMain className="mx-auto flex w-full max-w-md flex-1 items-center justify-center py-8">
			<Outlet />
		</AppShellMain>
	);
}
