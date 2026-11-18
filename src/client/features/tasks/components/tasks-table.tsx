import { Calendar, MessageSquare, UserCheck } from "lucide-react";
import { AppDataTable } from "#/client/shared/components/app-data-table";
import { AppButtonLink } from "#/client/shared/components/app-link";
import {
	formatTaskDueDate,
	TASK_PRIORITY_BADGE_VARIANTS,
	TASK_PRIORITY_LABELS,
	TASK_STATUS_BADGE_VARIANTS,
	TASK_STATUS_LABELS,
} from "#/client/shared/helpers/task-display";
import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import { useTasksTable } from "../hooks/use-tasks-table";

export function TasksTable() {
	const { table, columnCount, isPending } = useTasksTable();

	return (
		<AppDataTable
			table={table}
			columnCount={columnCount}
			isLoading={isPending}
			emptyMessage="ไม่พบงานที่ตรงกับเงื่อนไขหรือยังไม่มีงานในโครงการนี้"
			renderCell={(cell) => {
				const task = cell.row.original;

				if (cell.column.id === "code") {
					return (
						<AppButtonLink
							to="/projects/$projectId/tasks/$taskId"
							params={{ projectId: task.projectId, taskId: task.id }}
							variant="link"
							size="sm"
							className="h-auto p-0"
						>
							<Badge variant="outline">{task.code}</Badge>
						</AppButtonLink>
					);
				}

				if (cell.column.id === "title") {
					return (
						<div className="flex max-w-sm flex-col gap-0.5">
							<AppButtonLink
								to="/projects/$projectId/tasks/$taskId"
								params={{ projectId: task.projectId, taskId: task.id }}
								variant="link"
								size="sm"
								className="h-auto justify-start p-0 text-left font-medium"
							>
								<span className="truncate">{task.title}</span>
							</AppButtonLink>
							{task.description ? (
								<span className="truncate text-xs text-muted-foreground">
									{task.description}
								</span>
							) : null}
						</div>
					);
				}

				if (cell.column.id === "status") {
					return (
						<Badge variant={TASK_STATUS_BADGE_VARIANTS[task.status]}>
							{TASK_STATUS_LABELS[task.status]}
						</Badge>
					);
				}

				if (cell.column.id === "priority") {
					return (
						<Badge variant={TASK_PRIORITY_BADGE_VARIANTS[task.priority]}>
							{TASK_PRIORITY_LABELS[task.priority]}
						</Badge>
					);
				}

				if (cell.column.id === "assignee") {
					return task.assignee ? (
						<div className="flex items-center gap-1.5 text-sm">
							<UserCheck
								className="size-3.5 shrink-0 text-muted-foreground"
								aria-hidden="true"
							/>
							<span className="truncate">{task.assignee.name}</span>
						</div>
					) : (
						<span className="text-xs text-muted-foreground">ยังไม่มอบหมาย</span>
					);
				}

				if (cell.column.id === "dueDate") {
					return (
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<Calendar className="size-3.5 shrink-0" aria-hidden="true" />
							<span>{formatTaskDueDate(task.dueDate)}</span>
						</div>
					);
				}

				if (cell.column.id === "commentCount") {
					return (
						<div className="flex items-center gap-1.5 text-muted-foreground">
							<MessageSquare className="size-3.5" aria-hidden="true" />
							<span>{task.commentCount}</span>
						</div>
					);
				}

				if (cell.column.id === "updatedAt") {
					return (
						<span className="text-xs text-muted-foreground">
							{new Date(task.updatedAt).toLocaleString()}
						</span>
					);
				}

				return null;
			}}
		/>
	);
}
