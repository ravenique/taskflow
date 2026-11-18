import { ShieldCheck } from "lucide-react";
import { AppShellMain } from "#/client/shared/components/app-shell";
import { CreateRoleDialog } from "../components/create-role-dialog";
import { DeleteRoleDialog } from "../components/delete-role-dialog";
import { PermissionMatrixCard } from "../components/permission-matrix-card";
import { RolesListCard } from "../components/roles-list-card";
import { RolesAdminProvider } from "../contexts/roles-admin.context";

export function RolesAdminScreen() {
	return (
		<RolesAdminProvider>
			<AppShellMain className="mx-auto max-w-6xl py-8">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<ShieldCheck className="size-6 text-primary" aria-hidden="true" />
						<h1 className="text-2xl font-semibold tracking-tight">
							บทบาทและตารางสิทธิ์
						</h1>
					</div>
					<p className="text-sm text-muted-foreground">
						จัดการบทบาทและกำหนดสิทธิ์แบบละเอียดตามขอบเขต
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-[320px_1fr]">
					<RolesListCard />
					<PermissionMatrixCard />
				</div>

				<CreateRoleDialog />
				<DeleteRoleDialog />
			</AppShellMain>
		</RolesAdminProvider>
	);
}
