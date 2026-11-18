import { ShieldAlert } from "lucide-react";
import { AppButtonLink } from "#/client/shared/components/app-link";
import { AppShellMain } from "#/client/shared/components/app-shell";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";

export function ProjectRouteErrorScreen() {
	return (
		<AppShellMain className="mx-auto max-w-xl py-12">
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<ShieldAlert
							className="size-5 text-destructive"
							aria-hidden="true"
						/>
						<CardTitle>ไม่สามารถเข้าถึงโครงการนี้ได้</CardTitle>
					</div>
					<CardDescription>
						คุณอาจไม่มีสิทธิ์เข้าดูโครงการนี้ หรือโครงการดังกล่าวไม่มีอยู่ในระบบ
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AppButtonLink to="/projects" variant="outline" size="sm">
						กลับหน้ารายการโครงการ
					</AppButtonLink>
				</CardContent>
			</Card>
		</AppShellMain>
	);
}
