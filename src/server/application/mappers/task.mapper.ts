import type { Task } from "#/server/domain/tasks/task.entity";
import type { TaskComment } from "#/server/domain/tasks/task-comment.entity";
import type {
	TaskCommentDto,
	TaskDto,
	TaskUserSummary,
} from "#/shared/schemas/task.schema";

export class TaskMapper {
	static toDto(task: Task): TaskDto {
		return {
			id: task.id,
			projectId: task.projectId,
			code: task.code,
			title: task.title,
			description: task.description,
			status: task.status,
			priority: task.priority,
			assigneeId: task.assigneeId,
			reporterId: task.reporterId,
			dueDate: task.dueDate ? task.dueDate.toISOString() : null,
			createdAt: task.createdAt.toISOString(),
			updatedAt: task.updatedAt.toISOString(),
		};
	}

	static toCommentDto(
		comment: TaskComment,
		author: TaskUserSummary,
	): TaskCommentDto {
		return {
			id: comment.id,
			taskId: comment.taskId,
			author,
			body: comment.body,
			createdAt: comment.createdAt.toISOString(),
			updatedAt: comment.updatedAt.toISOString(),
		};
	}
}
