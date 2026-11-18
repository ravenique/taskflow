import { z } from "zod";
import {
	createPaginatedResultSchema,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	sortOrderSchema,
} from "./pagination.schema";
import { activityLogDtoSchema, projectStatusSchema } from "./project.schema";
import {
	taskPriorityFilterSchema,
	taskPrioritySchema,
	taskStatusFilterSchema,
	taskStatusSchema,
} from "./task.schema";

export const myTasksSortFieldSchema = z.enum([
	"projectKey",
	"code",
	"title",
	"status",
	"priority",
	"dueDate",
	"updatedAt",
]);
export type MyTasksSortField = z.infer<typeof myTasksSortFieldSchema>;

export const myTasksSearchSchema = z.object({
	search: z.string().trim().max(100).default("").catch(""),
	status: taskStatusFilterSchema.default("all").catch("all"),
	priority: taskPriorityFilterSchema.default("all").catch("all"),
	sortBy: myTasksSortFieldSchema.default("updatedAt").catch("updatedAt"),
	sortOrder: sortOrderSchema.default("desc").catch("desc"),
	page: z.number().int().min(1).default(DEFAULT_PAGE).catch(DEFAULT_PAGE),
	pageSize: z
		.number()
		.int()
		.min(1)
		.max(100)
		.default(DEFAULT_PAGE_SIZE)
		.catch(DEFAULT_PAGE_SIZE),
});
export type MyTasksSearch = z.infer<typeof myTasksSearchSchema>;

export const workspaceSummaryDtoSchema = z.object({
	activeProjectCount: z.number().int().nonnegative(),
	archivedProjectCount: z.number().int().nonnegative(),
	assignedOpenTaskCount: z.number().int().nonnegative(),
	assignedDoneTaskCount: z.number().int().nonnegative(),
});
export type WorkspaceSummaryDto = z.infer<typeof workspaceSummaryDtoSchema>;

export const workspaceActiveProjectDtoSchema = z.object({
	id: z.uuid(),
	key: z.string(),
	name: z.string(),
	status: projectStatusSchema,
	myRoleName: z.string().nullable(),
	openTaskCount: z.number().int().nonnegative(),
	memberCount: z.number().int().nonnegative(),
	updatedAt: z.string(),
});
export type WorkspaceActiveProjectDto = z.infer<
	typeof workspaceActiveProjectDtoSchema
>;

export const myAssignedTaskItemDtoSchema = z.object({
	id: z.uuid(),
	projectId: z.uuid(),
	projectKey: z.string(),
	projectName: z.string(),
	code: z.string(),
	title: z.string(),
	status: taskStatusSchema,
	priority: taskPrioritySchema,
	dueDate: z.string().nullable(),
	commentCount: z.number().int().nonnegative(),
	updatedAt: z.string(),
});
export type MyAssignedTaskItemDto = z.infer<typeof myAssignedTaskItemDtoSchema>;

export const listMyAssignedTasksResultDtoSchema = createPaginatedResultSchema(
	myAssignedTaskItemDtoSchema,
);
export type ListMyAssignedTasksResultDto = z.infer<
	typeof listMyAssignedTasksResultDtoSchema
>;

export const workspaceOverviewDtoSchema = z.object({
	summary: workspaceSummaryDtoSchema,
	activeProjects: z.array(workspaceActiveProjectDtoSchema),
	recentActivities: z.array(activityLogDtoSchema),
});
export type WorkspaceOverviewDto = z.infer<typeof workspaceOverviewDtoSchema>;
