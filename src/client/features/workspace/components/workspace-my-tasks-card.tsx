import { Briefcase } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { WorkspaceMyTasksTable } from "./workspace-my-tasks-table";
import { WorkspaceMyTasksToolbar } from "./workspace-my-tasks-toolbar";

export function WorkspaceMyTasksCard() {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Briefcase className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>งานที่ได้รับมอบหมายของฉัน</CardTitle>
				</div>
				<CardDescription>
					รวมงานจากทุกโครงการที่คุณเป็นผู้รับผิดชอบ พร้อมค้นหาและกรองผ่าน URL Search Params
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<WorkspaceMyTasksToolbar />
				<WorkspaceMyTasksTable />
			</CardContent>
		</Card>
	);
}
