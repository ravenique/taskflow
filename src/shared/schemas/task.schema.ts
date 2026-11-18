import { z } from "zod";
import {
	createPaginatedResultSchema,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	sortOrderSchema,
} from "./pagination.schema";
import { activityLogDtoSchema } from "./project.schema";

export const taskStatusSchema = z.enum([
	"todo",
	"in_progress",
	"in_review",
	"done",
	"cancelled",
]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const taskStatusFilterSchema = z.enum([
	"all",
	"todo",
	"in_progress",
	"in_review",
	"done",
	"cancelled",
]);
export type TaskStatusFilter = z.infer<typeof taskStatusFilterSchema>;

export const taskPriorityFilterSchema = z.enum([
	"all",
	"low",
	"medium",
	"high",
	"urgent",
]);
export type TaskPriorityFilter = z.infer<typeof taskPriorityFilterSchema>;

export const taskSortFieldSchema = z.enum([
	"code",
	"title",
	"status",
	"priority",
	"dueDate",
	"createdAt",
	"updatedAt",
]);
export type TaskSortField = z.infer<typeof taskSortFieldSchema>;

export const tasksSearchSchema = z.object({
	search: z.string().trim().max(100).default("").catch(""),
	status: taskStatusFilterSchema.default("all").catch("all"),
	priority: taskPriorityFilterSchema.default("all").catch("all"),
	assigneeFilter: z.string().trim().max(128).default("all").catch("all"),
	sortBy: taskSortFieldSchema.default("updatedAt").catch("updatedAt"),
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
export type TasksSearch = z.infer<typeof tasksSearchSchema>;

export const taskTitleSchema = z
	.string()
	.trim()
	.min(2, "หัวข้องานต้องมีอย่างน้อย 2 ตัวอักษร")
	.max(200, "หัวข้องานต้องไม่เกิน 200 ตัวอักษร");

export const taskDescriptionSchema = z
	.string()
	.trim()
	.max(5000, "รายละเอียดงานต้องไม่เกิน 5000 ตัวอักษร");

export const taskDueDateInputSchema = z
	.string()
	.trim()
	.max(40, "รูปแบบวันครบกำหนดไม่ถูกต้อง")
	.refine(
		(value) => value === "" || !Number.isNaN(Date.parse(value)),
		"รูปแบบวันครบกำหนดไม่ถูกต้อง",
	);

export const taskCommentBodySchema = z
	.string()
	.trim()
	.min(1, "กรุณากรอกข้อความความคิดเห็น")
	.max(3000, "ความคิดเห็นต้องไม่เกิน 3000 ตัวอักษร");

export const listTasksInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	params: tasksSearchSchema,
});
export type ListTasksInput = z.infer<typeof listTasksInputSchema>;

export const getTaskDetailInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	taskId: z.uuid("รหัสงานไม่ถูกต้อง"),
});
export type GetTaskDetailInput = z.infer<typeof getTaskDetailInputSchema>;

export const createTaskInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	title: taskTitleSchema,
	description: taskDescriptionSchema,
	priority: taskPrioritySchema,
	assigneeId: z.string().min(1).nullable(),
	dueDate: taskDueDateInputSchema.nullable(),
});
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

export const updateTaskInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	taskId: z.uuid("รหัสงานไม่ถูกต้อง"),
	title: taskTitleSchema,
	description: taskDescriptionSchema,
	priority: taskPrioritySchema,
	dueDate: taskDueDateInputSchema.nullable(),
});
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

export const transitionTaskStatusInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	taskId: z.uuid("รหัสงานไม่ถูกต้อง"),
	status: taskStatusSchema,
});
export type TransitionTaskStatusInput = z.infer<
	typeof transitionTaskStatusInputSchema
>;

export const assignTaskInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	taskId: z.uuid("รหัสงานไม่ถูกต้อง"),
	assigneeId: z.string().min(1).nullable(),
});
export type AssignTaskInput = z.infer<typeof assignTaskInputSchema>;

export const deleteTaskInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	taskId: z.uuid("รหัสงานไม่ถูกต้อง"),
});
export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>;

export const addTaskCommentInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	taskId: z.uuid("รหัสงานไม่ถูกต้อง"),
	body: taskCommentBodySchema,
});
export type AddTaskCommentInput = z.infer<typeof addTaskCommentInputSchema>;

export const deleteTaskCommentInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	taskId: z.uuid("รหัสงานไม่ถูกต้อง"),
	commentId: z.uuid("รหัสความคิดเห็นไม่ถูกต้อง"),
});
export type DeleteTaskCommentInput = z.infer<
	typeof deleteTaskCommentInputSchema
>;

export const taskDtoSchema = z.object({
	id: z.uuid(),
	projectId: z.uuid(),
	code: z.string(),
	title: z.string(),
	description: z.string(),
	status: taskStatusSchema,
	priority: taskPrioritySchema,
	assigneeId: z.string().nullable(),
	reporterId: z.string(),
	dueDate: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type TaskDto = z.infer<typeof taskDtoSchema>;

export const taskUserSummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
});
export type TaskUserSummary = z.infer<typeof taskUserSummarySchema>;

export const taskCommentDtoSchema = z.object({
	id: z.uuid(),
	taskId: z.uuid(),
	author: taskUserSummarySchema,
	body: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type TaskCommentDto = z.infer<typeof taskCommentDtoSchema>;

export const taskListItemDtoSchema = z.object({
	id: z.uuid(),
	projectId: z.uuid(),
	code: z.string(),
	title: z.string(),
	description: z.string(),
	status: taskStatusSchema,
	priority: taskPrioritySchema,
	assignee: taskUserSummarySchema.nullable(),
	reporter: taskUserSummarySchema,
	dueDate: z.string().nullable(),
	commentCount: z.number().int().nonnegative(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type TaskListItemDto = z.infer<typeof taskListItemDtoSchema>;

export const listTasksResultDtoSchema = createPaginatedResultSchema(
	taskListItemDtoSchema,
);
export type ListTasksResultDto = z.infer<typeof listTasksResultDtoSchema>;

export const taskDetailDtoSchema = z.object({
	id: z.uuid(),
	projectId: z.uuid(),
	code: z.string(),
	title: z.string(),
	description: z.string(),
	status: taskStatusSchema,
	priority: taskPrioritySchema,
	allowedTransitions: z.array(taskStatusSchema),
	assignee: taskUserSummarySchema.nullable(),
	reporter: taskUserSummarySchema,
	dueDate: z.string().nullable(),
	comments: z.array(taskCommentDtoSchema),
	activities: z.array(activityLogDtoSchema),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type TaskDetailDto = z.infer<typeof taskDetailDtoSchema>;
