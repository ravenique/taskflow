import { CheckCircle2, Clock, FolderKanban, ListTodo } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { Skeleton } from "#/client/shared/shadcn/components/ui/skeleton";
import { useWorkspaceOverview } from "../hooks/use-workspace-overview";

export function WorkspaceSummaryCards() {
	const { summary, isPending } = useWorkspaceOverview();

	if (isPending) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Skeleton className="h-28 w-full" />
				<Skeleton className="h-28 w-full" />
				<Skeleton className="h-28 w-full" />
				<Skeleton className="h-28 w-full" />
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardDescription>งานค้างของฉัน</CardDescription>
					<ListTodo className="size-4 text-primary" aria-hidden="true" />
				</CardHeader>
				<CardContent>
					<CardTitle className="text-2xl">
						{summary.assignedOpenTaskCount}
					</CardTitle>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardDescription>งานที่ปิดเสร็จแล้ว</CardDescription>
					<CheckCircle2
						className="size-4 text-muted-foreground"
						aria-hidden="true"
					/>
				</CardHeader>
				<CardContent>
					<CardTitle className="text-2xl">
						{summary.assignedDoneTaskCount}
					</CardTitle>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardDescription>โครงการที่เปิดใช้งาน</CardDescription>
					<FolderKanban className="size-4 text-primary" aria-hidden="true" />
				</CardHeader>
				<CardContent>
					<CardTitle className="text-2xl">
						{summary.activeProjectCount}
					</CardTitle>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardDescription>โครงการที่เก็บถาวร</CardDescription>
					<Clock className="size-4 text-muted-foreground" aria-hidden="true" />
				</CardHeader>
				<CardContent>
					<CardTitle className="text-2xl">
						{summary.archivedProjectCount}
					</CardTitle>
				</CardContent>
			</Card>
		</div>
	);
}
