import { z } from "zod";

export const roleScopeSchema = z.enum(["system", "project"]);
export type RoleScope = z.infer<typeof roleScopeSchema>;

export const systemPermissionCodeSchema = z.enum([
	"role:read",
	"role:manage",
	"user:read",
	"user:assign_role",
	"project:create",
	"project:read_all",
]);
export type SystemPermissionCode = z.infer<typeof systemPermissionCodeSchema>;

export const projectPermissionCodeSchema = z.enum([
	"project:read",
	"project:update",
	"project:delete",
	"project:manage_members",
	"task:create",
	"task:update",
	"task:assign",
	"task:delete",
	"comment:create",
	"comment:delete_any",
]);
export type ProjectPermissionCode = z.infer<typeof projectPermissionCodeSchema>;

export const permissionCodeSchema = z.union([
	systemPermissionCodeSchema,
	projectPermissionCodeSchema,
]);
export type PermissionCode = z.infer<typeof permissionCodeSchema>;

export interface PermissionCatalogItem {
	readonly code: PermissionCode;
	readonly scope: RoleScope;
	readonly description: string;
}

export const PERMISSION_CATALOG: readonly PermissionCatalogItem[] = [
	{
		code: "role:read",
		scope: "system",
		description: "ดูบทบาทระดับระบบและระดับโครงการพร้อมตารางสิทธิ์การใช้งาน",
	},
	{
		code: "role:manage",
		scope: "system",
		description: "สร้าง แก้ไข และลบบทบาทที่กำหนดเอง รวมถึงปรับเปลี่ยนสิทธิ์การใช้งาน",
	},
	{
		code: "user:read",
		scope: "system",
		description: "ดูรายชื่อผู้ใช้งานที่ลงทะเบียนในพื้นที่ทำงาน",
	},
	{
		code: "user:assign_role",
		scope: "system",
		description: "กำหนดหรือเพิกถอนบทบาทระดับระบบของผู้ใช้งาน",
	},
	{
		code: "project:create",
		scope: "system",
		description: "สร้างโครงการใหม่",
	},
	{
		code: "project:read_all",
		scope: "system",
		description: "ดูโครงการทั้งหมดในพื้นที่ทำงานโดยไม่ขึ้นกับการเป็นสมาชิก",
	},
	{
		code: "project:read",
		scope: "project",
		description: "ดูรายละเอียดโครงการ สมาชิก งาน และประวัติกิจกรรม",
	},
	{
		code: "project:update",
		scope: "project",
		description: "แก้ไขรายละเอียดโครงการ จัดเก็บ หรือกู้คืนโครงการ",
	},
	{
		code: "project:delete",
		scope: "project",
		description: "ลบโครงการอย่างถาวร",
	},
	{
		code: "project:manage_members",
		scope: "project",
		description: "เพิ่ม ปรับบทบาท หรือลบสมาชิกภายในโครงการ",
	},
	{
		code: "task:create",
		scope: "project",
		description: "สร้างงานใหม่ภายในโครงการ",
	},
	{
		code: "task:update",
		scope: "project",
		description: "แก้ไขรายละเอียดงาน ระดับความสำคัญ และเปลี่ยนสถานะงาน",
	},
	{
		code: "task:assign",
		scope: "project",
		description: "มอบหมายหรือเปลี่ยนผู้รับผิดชอบงานให้กับสมาชิกโครงการ",
	},
	{
		code: "task:delete",
		scope: "project",
		description: "ลบงานภายในโครงการ",
	},
	{
		code: "comment:create",
		scope: "project",
		description: "แสดงความคิดเห็นในงาน",
	},
	{
		code: "comment:delete_any",
		scope: "project",
		description: "ลบความคิดเห็นของสมาชิกทุกคนภายในโครงการ",
	},
] as const;

export const permissionDtoSchema = z.object({
	id: z.uuid(),
	code: permissionCodeSchema,
	scope: roleScopeSchema,
	description: z.string(),
});
export type PermissionDto = z.infer<typeof permissionDtoSchema>;

export const roleDtoSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	slug: z.string(),
	scope: roleScopeSchema,
	description: z.string(),
	isSystem: z.boolean(),
	permissionIds: z.array(z.uuid()),
	permissionCodes: z.array(permissionCodeSchema),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type RoleDto = z.infer<typeof roleDtoSchema>;

export const createRoleInputSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "ชื่อบทบาทต้องมีอย่างน้อย 2 ตัวอักษร")
		.max(100, "ชื่อบทบาทต้องไม่เกิน 100 ตัวอักษร"),
	slug: z
		.string()
		.trim()
		.toLowerCase()
		.min(2, "รหัสอ้างอิงต้องมีอย่างน้อย 2 ตัวอักษร")
		.max(100, "รหัสอ้างอิงต้องไม่เกิน 100 ตัวอักษร")
		.regex(
			/^[a-z][a-z0-9_]*$/,
			"รหัสอ้างอิงต้องขึ้นต้นด้วยตัวอักษรพิมพ์เล็ก a-z และใช้ได้เฉพาะ a-z, 0-9 หรือ _",
		),
	scope: roleScopeSchema,
	description: z.string().trim().max(300),
	permissionIds: z.array(z.uuid("รหัสสิทธิ์การเข้าถึงไม่ถูกต้อง")),
});
export type CreateRoleInput = z.infer<typeof createRoleInputSchema>;

export const updateRolePermissionsInputSchema = z.object({
	roleId: z.uuid("รหัสบทบาทไม่ถูกต้อง"),
	permissionIds: z.array(z.uuid("รหัสสิทธิ์การเข้าถึงไม่ถูกต้อง")),
});
export type UpdateRolePermissionsInput = z.infer<
	typeof updateRolePermissionsInputSchema
>;

export const deleteRoleInputSchema = z.object({
	roleId: z.uuid("รหัสบทบาทไม่ถูกต้อง"),
});
export type DeleteRoleInput = z.infer<typeof deleteRoleInputSchema>;

export const listRolesResultDtoSchema = z.object({
	roles: z.array(roleDtoSchema),
	permissions: z.array(permissionDtoSchema),
});
export type ListRolesResultDto = z.infer<typeof listRolesResultDtoSchema>;

export const myPermissionsDtoSchema = z.object({
	systemRoles: z.array(z.string()),
	systemPermissions: z.array(systemPermissionCodeSchema),
});
export type MyPermissionsDto = z.infer<typeof myPermissionsDtoSchema>;
