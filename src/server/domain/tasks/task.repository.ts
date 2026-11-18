import type { Task } from "./task.entity";
import type { TaskComment } from "./task-comment.entity";

export interface ITaskRepository {
	findById(projectId: string, taskId: string): Promise<Task | null>;
	save(task: Task): Promise<void>;
	delete(projectId: string, taskId: string): Promise<boolean>;
	findCommentById(
		projectId: string,
		taskId: string,
		commentId: string,
	): Promise<TaskComment | null>;
	saveComment(comment: TaskComment): Promise<void>;
	deleteComment(taskId: string, commentId: string): Promise<boolean>;
}
