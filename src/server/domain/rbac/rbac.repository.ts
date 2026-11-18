import type { SystemPermissionCode } from "#/shared/schemas/rbac.schema";
import type { Permission } from "./permission.entity";
import type { Role } from "./role.entity";

export interface UserSystemAccess {
	readonly roleSlugs: string[];
	readonly systemPermissions: SystemPermissionCode[];
}

export interface IRbacRepository {
	findAllRoles(): Promise<Role[]>;
	findRoleById(roleId: string): Promise<Role | null>;
	findRoleBySlug(slug: string): Promise<Role | null>;
	findRolesByIds(roleIds: readonly string[]): Promise<Role[]>;
	findAllPermissions(): Promise<Permission[]>;
	findPermissionsByIds(
		permissionsIds: readonly string[],
	): Promise<Permission[]>;
	saveRole(role: Role): Promise<void>;
	deleteRole(roleId: string): Promise<boolean>;
	getUserSystemAccess(userId: string): Promise<UserSystemAccess>;
	replaceUserSystemRoles(
		userId: string,
		roleIds: readonly string[],
	): Promise<void>;
}
