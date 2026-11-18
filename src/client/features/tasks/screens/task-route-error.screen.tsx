import { ShieldAlert } from "lucide-react";
import { useProjectId } from "#/client/features/projects/hooks/use-project-id";
import { AppButtonLink } from "#/client/shared/components/app-link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";

export function TaskRouteErrorScreen() {
	const projectId = useProjectId();

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<ShieldAlert className="size-5 text-destructive" aria-hidden="true" />
					<CardTitle>ไม่พบงานหรือไม่มีสิทธิ์เข้าถึง</CardTitle>
				</div>
				<CardDescription>
					งานนี้อาจถูกลบออกจากโครงการแล้ว หรืออยู่นอกขอบเขตโครงการที่คุณมีสิทธิ์
				</CardDescription>
			</CardHeader>
			<CardContent>
				<AppButtonLink
					to="/projects/$projectId/tasks"
					params={{ projectId }}
					variant="outline"
					size="sm"
				>
					กลับหน้ารายการงานทั้งหมด
				</AppButtonLink>
			</CardContent>
		</Card>
	);
}
