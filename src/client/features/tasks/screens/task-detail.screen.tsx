import { TaskActivityCard } from "../components/task-activity-card";
import { TaskAssigneeCard } from "../components/task-assignee-card";
import { TaskCommentsCard } from "../components/task-comments-card";
import { TaskDeleteDialog } from "../components/task-delete-dialog";
import { TaskEditCard } from "../components/task-edit-card";
import { TaskStatusActionsCard } from "../components/task-status-actions-card";
import { TaskSummaryHeader } from "../components/task-summary-header";
import { TaskDetailProvider } from "../contexts/task-detail.context";

export function TaskDetailScreen() {
	return (
		<TaskDetailProvider>
			<TaskSummaryHeader />
			<div className="grid gap-4 lg:grid-cols-3">
				<div className="flex flex-col gap-4 lg:col-span-2">
					<TaskEditCard />
					<TaskCommentsCard />
				</div>
				<div className="flex flex-col gap-4">
					<TaskStatusActionsCard />
					<TaskAssigneeCard />
					<TaskActivityCard />
				</div>
			</div>
			<TaskDeleteDialog />
		</TaskDetailProvider>
	);
}
