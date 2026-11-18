import type { Permission } from "#/server/domain/rbac/permission.entity";
import type { Role } from "#/server/domain/rbac/role.entity";
import type { PermissionDto, RoleDto } from "#/shared/schemas/rbac.schema";

export class RbacMapper {
	static toPermissionDto(permission: Permission): PermissionDto {
		return {
			id: permission.id,
			code: permission.code,
			scope: permission.scope,
			description: permission.description,
		};
	}

	static toRoleDto(role: Role): RoleDto {
		return {
			id: role.id,
			name: role.name,
			slug: role.slug,
			scope: role.scope,
			description: role.description,
			isSystem: role.isSystem,
			permissionIds: role.permissions.map((permission) => permission.id),
			permissionCodes: role.permissions.map((permission) => permission.code),
			createdAt: role.createdAt.toISOString(),
			updatedAt: role.updatedAt.toISOString(),
		};
	}
}
