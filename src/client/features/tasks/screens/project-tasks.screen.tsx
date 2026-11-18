import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { CreateTaskDialog } from "../components/create-task-dialog";
import { TasksTable } from "../components/tasks-table";
import { TasksToolbar } from "../components/tasks-toolbar";
import { TasksListProvider } from "../contexts/tasks-list.context";

export function ProjectTasksScreen() {
	return (
		<TasksListProvider>
			<Card>
				<CardHeader>
					<CardTitle>รายการงานภายในโครงการ</CardTitle>
					<CardDescription>
						ค้นหา กรองตามสถานะ ความสำคัญ ผู้รับผิดชอบ และเรียงลำดับข้อมูล
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<TasksToolbar />
					<TasksTable />
				</CardContent>
			</Card>
			<CreateTaskDialog />
		</TasksListProvider>
	);
}
