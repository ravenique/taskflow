import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { AppButtonLink } from "#/client/shared/components/app-link";
import {
	Avatar,
	AvatarFallback,
} from "#/client/shared/shadcn/components/ui/avatar";
import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/client/shared/shadcn/components/ui/dropdown-menu";
import { Skeleton } from "#/client/shared/shadcn/components/ui/skeleton";
import { useAuthHeaderControls } from "../hooks/use-auth-header-controls";

export function AuthHeaderControls() {
	const {
		isPending,
		user,
		initials,
		primaryRole,
		isSigningOut,
		handleGoWorkspace,
		handleSignOut,
	} = useAuthHeaderControls();

	if (isPending) {
		return <Skeleton className="h-8 w-32" />;
	}

	if (!user) {
		return (
			<div className="flex items-center gap-2">
				<AppButtonLink to="/sign-in" variant="ghost" size="sm">
					เข้าสู่ระบบ
				</AppButtonLink>
				<AppButtonLink to="/sign-up" variant="outline" size="sm">
					สมัครสมาชิก
				</AppButtonLink>
			</div>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="outline" className="gap-2" />}
			>
				<Avatar size="sm">
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<span className="max-w-32 truncate">{user.name}</span>
				<ChevronDown
					className="size-3.5 text-muted-foreground"
					aria-hidden="true"
				/>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="flex flex-col gap-1.5">
						<span className="flex items-center justify-between">
							<span className="text-sm font-medium text-foreground">
								{user.name}
							</span>
							<Badge variant="secondary">{primaryRole}</Badge>
						</span>
						<span className="truncate text-xs font-normal text-muted-foreground">
							{user.email}
						</span>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => void handleGoWorkspace()}>
					<LayoutDashboard aria-hidden="true" />
					<span>พื้นที่ทำงาน</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant="destructive"
					disabled={isSigningOut}
					onClick={() => void handleSignOut()}
				>
					<LogOut aria-hidden="true" />
					<span>{isSigningOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
