import type { TaskStatus } from "#/shared/schemas/task.schema";
import { InvalidTaskStatusTransitionError } from "./task.errors";

const TASK_ALLOWED_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
	todo: ["in_progress", "cancelled"],
	in_progress: ["in_review", "done", "todo", "cancelled"],
	in_review: ["done", "in_progress", "cancelled"],
	done: ["in_progress"],
	cancelled: ["todo"],
};

export function getAllowedTaskTransitions(status: TaskStatus): TaskStatus[] {
	return [...TASK_ALLOWED_TRANSITIONS[status]];
}

export function canTransitionTaskStatus(
	fromStatus: TaskStatus,
	toStatus: TaskStatus,
): boolean {
	return TASK_ALLOWED_TRANSITIONS[fromStatus].includes(toStatus);
}

export function assertTaskStatusTransition(
	fromStatus: TaskStatus,
	toStatus: TaskStatus,
): void {
	if (fromStatus === toStatus) {
		throw new InvalidTaskStatusTransitionError(
			fromStatus,
			toStatus,
			`Task อยู่ในสถานะ '${fromStatus}' อยู่แล้ว`,
		);
	}

	if (!canTransitionTaskStatus(fromStatus, toStatus)) {
		throw new InvalidTaskStatusTransitionError(fromStatus, toStatus);
	}
}
