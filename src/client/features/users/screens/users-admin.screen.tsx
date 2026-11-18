import { Users } from "lucide-react";
import { AppShellMain } from "#/client/shared/components/app-shell";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { AssignUserRolesDialog } from "../components/assign-user-roles-dialog";
import { UsersTable } from "../components/users-table";
import { UsersToolbar } from "../components/users-toolbar";
import { UsersAdminProvider } from "../contexts/users-admin.context";

export function UsersAdminScreen() {
	return (
		<UsersAdminProvider>
			<AppShellMain className="mx-auto max-w-6xl py-8">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Users className="size-5 text-primary" aria-hidden="true" />
							<CardTitle>ผู้ใช้งานพื้นที่ทำงานและบทบาทระดับระบบ</CardTitle>
						</div>
						<CardDescription>
							รายชื่อผู้ใช้งานทั้งหมดในระบบและการมอบหมายบทบาทระดับระบบ
						</CardDescription>
						<Separator />
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<UsersToolbar />
						<UsersTable />
					</CardContent>
				</Card>

				<AssignUserRolesDialog />
			</AppShellMain>
		</UsersAdminProvider>
	);
}
