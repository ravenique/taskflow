import { and, eq } from "drizzle-orm";
import { Task } from "#/server/domain/tasks/task.entity";
import type { ITaskRepository } from "#/server/domain/tasks/task.repository";
import { TaskComment } from "#/server/domain/tasks/task-comment.entity";
import { DrizzleBaseRepository } from "#/server/infrastructure/drizzle/base.repository";
import type { AppDb, AppTx } from "#/server/infrastructure/drizzle/db";
import { taskComments, tasks } from "#/server/infrastructure/drizzle/schema";

type TaskRow = typeof tasks.$inferSelect;
type TaskCommentRow = typeof taskComments.$inferSelect;

export class DrizzleTaskRepository
	extends DrizzleBaseRepository<AppDb, AppTx>
	implements ITaskRepository
{
	async findById(projectId: string, taskId: string): Promise<Task | null> {
		const [row] = await this.executor
			.select()
			.from(tasks)
			.where(and(eq(tasks.projectId, projectId), eq(tasks.id, taskId)))
			.limit(1);

		return row ? this.toTaskEntity(row) : null;
	}

	async save(task: Task): Promise<void> {
		await this.executor
			.insert(tasks)
			.values({
				id: task.id,
				projectId: task.projectId,
				code: task.code,
				title: task.title,
				description: task.description,
				status: task.status,
				priority: task.priority,
				assigneeId: task.assigneeId,
				reporterId: task.reporterId,
				dueDate: task.dueDate,
				createdAt: task.createdAt,
				updatedAt: task.updatedAt,
			})
			.onConflictDoUpdate({
				target: tasks.id,
				set: {
					title: task.title,
					description: task.description,
					status: task.status,
					priority: task.priority,
					assigneeId: task.assigneeId,
					dueDate: task.dueDate,
					updatedAt: task.updatedAt,
				},
			});
	}

	async delete(projectId: string, taskId: string): Promise<boolean> {
		const deleted = await this.executor
			.delete(tasks)
			.where(and(eq(tasks.projectId, projectId), eq(tasks.id, taskId)))
			.returning({ id: tasks.id });

		return deleted.length > 0;
	}

	async findCommentById(
		projectId: string,
		taskId: string,
		commentId: string,
	): Promise<TaskComment | null> {
		const [row] = await this.executor
			.select({
				comment: taskComments,
			})
			.from(taskComments)
			.innerJoin(tasks, eq(taskComments.taskId, tasks.id))
			.where(
				and(
					eq(taskComments.id, commentId),
					eq(taskComments.taskId, taskId),
					eq(tasks.projectId, projectId),
				),
			)
			.limit(1);

		return row ? this.toCommentEntity(row.comment) : null;
	}

	async saveComment(comment: TaskComment): Promise<void> {
		await this.executor
			.insert(taskComments)
			.values({
				id: comment.id,
				taskId: comment.taskId,
				authorId: comment.authorId,
				body: comment.body,
				createdAt: comment.createdAt,
				updatedAt: comment.updatedAt,
			})
			.onConflictDoUpdate({
				target: taskComments.id,
				set: {
					body: comment.body,
					updatedAt: comment.updatedAt,
				},
			});
	}

	async deleteComment(taskId: string, commentId: string): Promise<boolean> {
		const deleted = await this.executor
			.delete(taskComments)
			.where(
				and(eq(taskComments.id, commentId), eq(taskComments.taskId, taskId)),
			)
			.returning({ id: taskComments.id });

		return deleted.length > 0;
	}

	private toTaskEntity(row: TaskRow): Task {
		return Task.reconstitute(row.id, {
			projectId: row.projectId,
			code: row.code,
			title: row.title,
			description: row.description,
			status: row.status,
			priority: row.priority,
			assigneeId: row.assigneeId,
			reporterId: row.reporterId,
			dueDate: row.dueDate,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		});
	}

	private toCommentEntity(row: TaskCommentRow): TaskComment {
		return TaskComment.reconstitute(row.id, {
			taskId: row.taskId,
			authorId: row.authorId,
			body: row.body,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		});
	}
}
