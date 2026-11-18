import {
	FolderKanban,
	LayoutDashboard,
	ShieldCheck,
	Users,
} from "lucide-react";
import { AppButtonLink } from "#/client/shared/components/app-link";
import { useWorkspaceNav } from "../hooks/use-workspace-nav";

export function WorkspaceNav() {
	const {
		isAuthenticated,
		canReadRoles,
		canReadUsers,
		isWorkspaceActive,
		isProjectsActive,
		isRolesActive,
		isUsersActive,
	} = useWorkspaceNav();

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="flex flex-wrap items-center gap-1">
			<AppButtonLink
				to="/"
				variant={isWorkspaceActive ? "secondary" : "ghost"}
				size="sm"
			>
				<LayoutDashboard aria-hidden="true" />
				<span>พื้นที่ทำงาน</span>
			</AppButtonLink>

			<AppButtonLink
				to="/projects"
				variant={isProjectsActive ? "secondary" : "ghost"}
				size="sm"
			>
				<FolderKanban aria-hidden="true" />
				<span>โครงการ</span>
			</AppButtonLink>

			{canReadRoles ? (
				<AppButtonLink
					to="/admin/roles"
					variant={isRolesActive ? "secondary" : "ghost"}
					size="sm"
				>
					<ShieldCheck aria-hidden="true" />
					<span>จัดการบทบาท</span>
				</AppButtonLink>
			) : null}

			{canReadUsers ? (
				<AppButtonLink
					to="/admin/users"
					variant={isUsersActive ? "secondary" : "ghost"}
					size="sm"
				>
					<Users aria-hidden="true" />
					<span>ผู้ใช้งาน</span>
				</AppButtonLink>
			) : null}
		</div>
	);
}
