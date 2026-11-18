import { z } from "zod";
import {
	createPaginatedResultSchema,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	sortOrderSchema,
} from "./pagination.schema";
import { projectPermissionCodeSchema } from "./rbac.schema";

export const PROJECT_KEY_PATTERN = /^[A-Z][A-Z0-9]{1,9}$/;

export const projectStatusSchema = z.enum(["active", "archived"]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectStatusFilterSchema = z.enum(["all", "active", "archived"]);
export type ProjectStatusFilter = z.infer<typeof projectStatusFilterSchema>;

export const projectSortFieldSchema = z.enum([
	"key",
	"name",
	"status",
	"createdAt",
	"updatedAt",
]);
export type ProjectSortField = z.infer<typeof projectSortFieldSchema>;

export const projectsSearchSchema = z.object({
	search: z.string().trim().max(100).default("").catch(""),
	status: projectStatusFilterSchema.default("all").catch("all"),
	sortBy: projectSortFieldSchema.default("updatedAt").catch("updatedAt"),
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
export type ProjectsSearch = z.infer<typeof projectsSearchSchema>;

export const createProjectInputSchema = z.object({
	key: z
		.string()
		.trim()
		.toUpperCase()
		.min(2, "รหัสโครงการต้องมีอย่างน้อย 2 ตัวอักษร")
		.max(10, "รหัสโครงการต้องไม่เกิน 10 ตัวอักษร")
		.regex(
			PROJECT_KEY_PATTERN,
			"รหัสโครงการต้องขึ้นต้นด้วยตัวอักษรภาษาอังกฤษ A-Z และตามด้วย A-Z หรือ 0-9 เท่านั้น",
		),
	name: z
		.string()
		.trim()
		.min(2, "ชื่อโครงการต้องมีอย่างน้อย 2 ตัวอักษร")
		.max(150, "ชื่อโครงการต้องไม่เกิน 150 ตัวอักษร"),
	description: z.string().trim().max(1000, "คำอธิบายต้องไม่เกิน 1000 ตัวอักษร"),
});
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const updateProjectInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	name: z
		.string()
		.trim()
		.min(2, "ชื่อโครงการต้องมีอย่างน้อย 2 ตัวอักษร")
		.max(150, "ชื่อโครงการต้องไม่เกิน 150 ตัวอักษร"),
	description: z.string().trim().max(1000, "คำอธิบายต้องไม่เกิน 1000 ตัวอักษร"),
});
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

export const projectActionInputSchema = z.object({
	projectId: z.uuid("รหัสโปรเจกต์ไม่ถูกต้อง"),
});
export type ProjectActionInput = z.infer<typeof projectActionInputSchema>;

export const projectDtoSchema = z.object({
	id: z.uuid(),
	key: z.string(),
	name: z.string(),
	description: z.string(),
	status: projectStatusSchema,
	taskSequence: z.number().int().nonnegative(),
	createdById: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type ProjectDto = z.infer<typeof projectDtoSchema>;

export const projectListItemDtoSchema = z.object({
	id: z.uuid(),
	key: z.string(),
	name: z.string(),
	description: z.string(),
	status: projectStatusSchema,
	taskSequence: z.number().int().nonnegative(),
	createdById: z.string(),
	createdByName: z.string(),
	memberCount: z.number().int().nonnegative(),
	taskCount: z.number().int().nonnegative(),
	myRoleName: z.string().nullable(),
	canUpdate: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type ProjectListItemDto = z.infer<typeof projectListItemDtoSchema>;

export const listProjectsResultDtoSchema = createPaginatedResultSchema(
	projectListItemDtoSchema,
);
export type ListProjectsResultDto = z.infer<typeof listProjectsResultDtoSchema>;

export const projectRoleSummarySchema = z.object({
	id: z.uuid(),
	name: z.string(),
	slug: z.string(),
});
export type ProjectRoleSummary = z.infer<typeof projectRoleSummarySchema>;

export const projectDetailDtoSchema = z.object({
	id: z.uuid(),
	key: z.string(),
	name: z.string(),
	description: z.string(),
	status: projectStatusSchema,
	taskSequence: z.number().int().nonnegative(),
	createdById: z.string(),
	createdByName: z.string(),
	memberCount: z.number().int().nonnegative(),
	taskCount: z.number().int().nonnegative(),
	myRole: projectRoleSummarySchema.nullable(),
	myPermissions: z.array(projectPermissionCodeSchema),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type ProjectDetailDto = z.infer<typeof projectDetailDtoSchema>;

export const getProjectDetailInputSchema = z.object({
	projectId: z.uuid("รหัสโปรเจกต์ไม่ถูกต้อง"),
});
export type GetProjectDetailInput = z.infer<typeof getProjectDetailInputSchema>;

export const projectMemberDtoSchema = z.object({
	id: z.uuid(),
	projectId: z.uuid(),
	userId: z.string(),
	userName: z.string(),
	userEmail: z.string(),
	roleId: z.uuid(),
	roleName: z.string(),
	roleSlug: z.string(),
	isOwnerRole: z.boolean(),
	joinedAt: z.string(),
});
export type ProjectMemberDto = z.infer<typeof projectMemberDtoSchema>;

export const projectRoleOptionDtoSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	slug: z.string(),
	description: z.string(),
	isSystem: z.boolean(),
	permissions: z.array(projectPermissionCodeSchema),
});
export type ProjectRoleOptionDto = z.infer<typeof projectRoleOptionDtoSchema>;

export const invitableUserDtoSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
});
export type InvitableUserDto = z.infer<typeof invitableUserDtoSchema>;

export const listProjectMembersResultDtoSchema = z.object({
	members: z.array(projectMemberDtoSchema),
	availableRoles: z.array(projectRoleOptionDtoSchema),
	invitableUsers: z.array(invitableUserDtoSchema),
});
export type ListProjectMembersResultDto = z.infer<
	typeof listProjectMembersResultDtoSchema
>;

export const addProjectMemberInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	userId: z.string().min(1, "กรุณาเลือกผู้ใช้งาน"),
	roleId: z.uuid("กรุณาเลือกบทบาทภายในโครงการ"),
});
export type AddProjectMemberInput = z.infer<typeof addProjectMemberInputSchema>;

export const changeProjectMemberRoleInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	memberId: z.uuid("รหัสสมาชิกไม่ถูกต้อง"),
	roleId: z.uuid("กรุณาเลือกบทบาทภายในโครงการ"),
});
export type ChangeProjectMemberRoleInput = z.infer<
	typeof changeProjectMemberRoleInputSchema
>;

export const removeProjectMemberInputSchema = z.object({
	projectId: z.uuid("รหัสโปรเจกต์ไม่ถูกต้อง"),
	memberId: z.uuid("รหัสสมาชิกไม่ถูกต้อง"),
});
export type RemoveProjectMemberInput = z.infer<
	typeof removeProjectMemberInputSchema
>;

export const activityLogMetadataSchema = z.record(z.string(), z.json());
export type ActivityLogMetadata = z.infer<typeof activityLogMetadataSchema>;

export const activityLogDtoSchema = z.object({
	id: z.uuid(),
	projectId: z.uuid(),
	taskId: z.uuid().nullable(),
	actorId: z.string(),
	actorName: z.string(),
	actorEmail: z.string(),
	action: z.string(),
	metadata: activityLogMetadataSchema,
	createdAt: z.string(),
});
export type ActivityLogDto = z.infer<typeof activityLogDtoSchema>;

export const listProjectActivityInputSchema = z.object({
	projectId: z.uuid("รหัสโปรเจกต์ไม่ถูกต้อง"),
	limit: z.number().int().min(1).max(100).default(50).catch(50),
});
export type ListProjectActivityInput = z.infer<
	typeof listProjectActivityInputSchema
>;
