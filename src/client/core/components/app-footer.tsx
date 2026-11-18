import { AppShellFooter } from "#/client/shared/components/app-shell";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";

export function AppFooter() {
	return (
		<AppShellFooter className="mt-8 w-full max-w-6xl flex-col gap-3 py-4 text-muted-foreground">
			<Separator />
			<div className="flex w-full flex-wrap items-center justify-between gap-2">
				<span>TaskFlow &mdash; Project &amp; Task Management</span>
				<span>Clean Architecture &middot; DDD &middot; TanStack Start</span>
			</div>
		</AppShellFooter>
	);
}
