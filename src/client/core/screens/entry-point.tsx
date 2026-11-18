import { Outlet } from "@tanstack/react-router";
import { AppShellRoot } from "#/client/shared/components/app-shell";
import { ThemeProvider } from "#/client/shared/shadcn/components/theme-provider";
import { Toaster } from "#/client/shared/shadcn/components/ui/toast";
import { AppFooter } from "../components/app-footer";
import { AppHeader } from "../components/app-header";

/**
 * เพิ่ม Context Providers ที่นี่
 */
export function EntryPoint() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="_taskflow-theme">
			<Toaster>
				<AppShellRoot>
					<AppHeader />
					<Outlet />
					<AppFooter />
				</AppShellRoot>
			</Toaster>
		</ThemeProvider>
	);
}
