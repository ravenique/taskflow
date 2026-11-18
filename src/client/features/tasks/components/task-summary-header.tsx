import { ArrowLeft, Calendar, Lock, Trash2, UserCheck } from "lucide-react";
import { AppButtonLink } from "#/client/shared/components/app-link";
import {
	TASK_PRIORITY_BADGE_VARIANTS,
	TASK_PRIORITY_LABELS,
	TASK_STATUS_BADGE_VARIANTS,
	TASK_STATUS_LABELS,
} from "#/client/shared/helpers/task-display";
import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { Skeleton } from "#/client/shared/shadcn/components/ui/skeleton";
import { useTaskSummary } from "../hooks/use-task-summary";

export function TaskSummaryHeader() {
	const {
		projectId,
		task,
		isPending,
		isArchived,
		canDeleteTask,
		dueDateLabel,
		updatedAtLabel,
		openDeleteDialog,
	} = useTaskSummary();

	if (isPending) {
		return (
			<Card>
				<CardHeader className="gap-3">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-8 w-2/3" />
				</CardHeader>
			</Card>
		);
	}

	if (!task) {
		return null;
	}

	return (
		<Card>
			<CardHeader className="gap-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-wrap items-center gap-2">
						<AppButtonLink
							to="/projects/$projectId/tasks"
							params={{ projectId }}
							variant="ghost"
							size="sm"
						>
							<ArrowLeft aria-hidden="true" />
							<span>รายการงานทั้งหมด</span>
						</AppButtonLink>
						<Badge variant="outline">{task.code}</Badge>
						<Badge variant={TASK_STATUS_BADGE_VARIANTS[task.status]}>
							{TASK_STATUS_LABELS[task.status]}
						</Badge>
						<Badge variant={TASK_PRIORITY_BADGE_VARIANTS[task.priority]}>
							{TASK_PRIORITY_LABELS[task.priority]}
						</Badge>
						{isArchived ? (
							<Badge variant="secondary">
								<Lock aria-hidden="true" />
								<span>โครงการถูกเก็บถาวร</span>
							</Badge>
						) : null}
					</div>

					{canDeleteTask ? (
						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={openDeleteDialog}
						>
							<Trash2 aria-hidden="true" />
							<span>ลบงาน</span>
						</Button>
					) : null}
				</div>

				<CardTitle className="text-xl">{task.title}</CardTitle>
				<CardDescription>
					ผู้สร้างงาน: {task.reporter.name} ({task.reporter.email}) &middot;
					อัปเดตล่าสุด {updatedAtLabel}
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
				<div className="flex items-center gap-1.5">
					<UserCheck className="size-4" aria-hidden="true" />
					<span>
						ผู้รับผิดชอบ:{" "}
						<strong className="font-medium text-foreground">
							{task.assignee ? task.assignee.name : "ยังไม่ระบุ"}
						</strong>
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Calendar className="size-4" aria-hidden="true" />
					<span>
						วันครบกำหนด:{" "}
						<strong className="font-medium text-foreground">
							{dueDateLabel}
						</strong>
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
