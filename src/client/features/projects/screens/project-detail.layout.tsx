import { Outlet } from "@tanstack/react-router";
import { AppShellMain } from "#/client/shared/components/app-shell";
import { ProjectHeader } from "../components/project-header";

export function ProjectDetailLayout() {
	return (
		<AppShellMain className="mx-auto max-w-6xl py-8">
			<ProjectHeader />
			<Outlet />
		</AppShellMain>
	);
}
