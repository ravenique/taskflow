import { z } from "zod";

export const adminUserRoleSummarySchema = z.object({
	id: z.uuid(),
	name: z.string(),
	slug: z.string(),
});
export type AdminUserRoleSummary = z.infer<typeof adminUserRoleSummarySchema>;

export const adminUserDtoSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.email(),
	emailVerified: z.boolean(),
	createdAt: z.string(),
	systemRoles: z.array(adminUserRoleSummarySchema),
});
export type AdminUserDto = z.infer<typeof adminUserDtoSchema>;

export const listUsersInputSchema = z.object({
	search: z.string().trim().max(100).optional(),
});
export type ListUsersInput = z.infer<typeof listUsersInputSchema>;

export const assignUserSystemRolesInputSchema = z.object({
	userId: z.string().min(1, "กรุณาระบุรหัสผู้ใช้งาน"),
	roleIds: z.array(z.uuid("รหัสบทบาทไม่ถูกต้อง")),
});
export type AssignUserSystemRolesInput = z.infer<
	typeof assignUserSystemRolesInputSchema
>;
