import type { MyTasksSearch } from "#/shared/schemas/workspace.schema";

export const workspaceKeys = {
	all: ["workspace"] as const,
	overview: () => [...workspaceKeys.all, "overview"] as const,
	myTasks: (params: MyTasksSearch) =>
		[...workspaceKeys.all, "my-tasks", params] as const,
};
