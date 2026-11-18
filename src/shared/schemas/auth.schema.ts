import { z } from "zod";

export const signInInputSchema = z.object({
	email: z
		.string()
		.trim()
		.toLowerCase()
		.pipe(z.email("กรุณากรอกรูปแบบอีเมลให้ถูกต้อง")),
	password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
});

export type SignInInput = z.infer<typeof signInInputSchema>;

export const signUpInputSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "ชื่อผู้ใช้งานต้องมีอย่างน้อย 2 ตัวอักษร")
		.max(100, "ชื่อผู้ใช้งานต้องไม่เกิน 100 ตัวอักษร"),
	email: z
		.string()
		.trim()
		.toLowerCase()
		.pipe(z.email("กรุณากรอกรูปแบบอีเมลให้ถูกต้อง")),
	password: z
		.string()
		.min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
		.max(128, "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร"),
});

export type SignUpInput = z.infer<typeof signUpInputSchema>;

export const authUserDtoSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	emailVerified: z.boolean(),
	image: z.string().nullable(),
	systemRoles: z.array(z.string()),
	systemPermissions: z.array(z.string()),
});
export type AuthUserDto = z.infer<typeof authUserDtoSchema>;

export const authSessionInfoDtoSchema = z.object({
	id: z.string(),
	userId: z.string(),
	expiresAt: z.string(),
});
export type AuthSessionInfoDto = z.infer<typeof authSessionInfoDtoSchema>;

export const authSessionDtoSchema = z.object({
	user: authUserDtoSchema,
	session: authSessionInfoDtoSchema,
});
export type AuthSessionDto = z.infer<typeof authSessionDtoSchema>;

export const currentSessionResultDtoSchema = authSessionDtoSchema.nullable();
export type CurrentSessionResultDto = z.infer<
	typeof currentSessionResultDtoSchema
>;

export const authCheckResultDtoSchema = z.object({
	authenticated: z.literal(true),
	userId: z.string(),
	email: z.string(),
	systemRoles: z.array(z.string()),
	systemPermissions: z.array(z.string()),
});
export type AuthCheckResultDto = z.infer<typeof authCheckResultDtoSchema>;
