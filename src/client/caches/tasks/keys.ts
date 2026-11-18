import type { TasksSearch } from "#/shared/schemas/task.schema";

export const tasksKeys = {
	all: ["tasks"] as const,
	project: (projectId: string) => [...tasksKeys.all, projectId] as const,
	list: (projectId: string, params: TasksSearch) =>
		[...tasksKeys.project(projectId), "list", params] as const,
	detail: (projectId: string, taskId: string) =>
		[...tasksKeys.project(projectId), "detail", taskId] as const,
};
