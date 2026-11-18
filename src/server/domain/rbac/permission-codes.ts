import type {
	PermissionCode,
	ProjectPermissionCode,
	SystemPermissionCode,
} from "#/shared/schemas/rbac.schema";

export const SYSTEM_PERMISSIONS = {
	ROLE_READ: "role:read",
	ROLE_MANAGE: "role:manage",
	USER_READ: "user:read",
	USER_ASSIGN_ROLE: "user:assign_role",
	PROJECT_CREATE: "project:create",
	PROJECT_READ_ALL: "project:read_all",
} as const satisfies Record<string, SystemPermissionCode>;

export const PROJECT_PERMISSIONS = {
	PROJECT_READ: "project:read",
	PROJECT_UPDATE: "project:update",
	PROJECT_DELETE: "project:delete",
	PROJECT_MANAGE_MEMBERS: "project:manage_members",
	TASK_CREATE: "task:create",
	TASK_UPDATE: "task:update",
	TASK_ASSIGN: "task:assign",
	TASK_DELETE: "task:delete",
	COMMENT_CREATE: "comment:create",
	COMMENT_DELETE_ANY: "comment:delete_any",
} as const satisfies Record<string, ProjectPermissionCode>;

export function hasPermission(
	grantedPermissions: readonly string[],
	requiredPermission: PermissionCode,
): boolean {
	return grantedPermissions.includes(requiredPermission);
}
