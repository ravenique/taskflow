import type {
	ListTasksResultDto,
	TaskDetailDto,
	TasksSearch,
} from "#/shared/schemas/task.schema";

export interface ITaskQueries {
	listTasks(
		projectId: string,
		params: TasksSearch,
	): Promise<ListTasksResultDto>;
	findTaskDetailById(
		projectId: string,
		taskId: string,
	): Promise<TaskDetailDto | null>;
}
