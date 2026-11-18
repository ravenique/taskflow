import type { AdminUserDto } from "#/shared/schemas/user.schema";

export interface IUserQueries {
	listAdminUsers(search?: string): Promise<AdminUserDto[]>;
	existsById(userId: string): Promise<boolean>;
}
