import { ForbiddenDomainError } from "#/server/domain/common/errors";
import {
	hasPermission,
	PROJECT_PERMISSIONS,
	SYSTEM_PERMISSIONS,
} from "#/server/domain/rbac/permission-codes";
import type {
	ProjectPermissionCode,
	SystemPermissionCode,
} from "#/shared/schemas/rbac.schema";

export class AuthorizationService {
	hasSystemPermission(
		grantedPermissions: readonly string[],
		requiredPermission: SystemPermissionCode,
	): boolean {
		return hasPermission(grantedPermissions, requiredPermission);
	}

	assertSystemPermission(
		grantedPermissions: readonly string[],
		requiredPermission: SystemPermissionCode,
	): void {
		if (!this.hasSystemPermission(grantedPermissions, requiredPermission)) {
			throw new ForbiddenDomainError(
				`ไม่มีสิทธิ์ดำเนินการ: ต้องมีสิทธิ์ '${requiredPermission}'`,
			);
		}
	}

	hasProjectPermission(
		grantedPermissions: readonly string[],
		requiredPermission: ProjectPermissionCode,
	): boolean {
		return hasPermission(grantedPermissions, requiredPermission);
	}

	assertProjectPermission(
		grantedPermissions: readonly string[],
		requiredPermission: ProjectPermissionCode,
	): void {
		if (!this.hasProjectPermission(grantedPermissions, requiredPermission)) {
			throw new ForbiddenDomainError(
				`ไม่มีสิทธิ์ดำเนินการในโปรเจกต์นี้: ต้องมีสิทธิ์ '${requiredPermission}'`,
			);
		}
	}

	canReadProject(
		actorSystemPermissions: readonly string[],
		projectPermissions: readonly string[],
	): boolean {
		return (
			this.hasSystemPermission(
				actorSystemPermissions,
				SYSTEM_PERMISSIONS.PROJECT_READ_ALL,
			) ||
			this.hasProjectPermission(
				projectPermissions,
				PROJECT_PERMISSIONS.PROJECT_READ,
			)
		);
	}

	assertProjectReadAccess(
		actorSystemPermissions: readonly string[],
		projectPermissions: readonly string[],
	): void {
		if (!this.canReadProject(actorSystemPermissions, projectPermissions)) {
			throw new ForbiddenDomainError("คุณไม่มีสิทธิ์เข้าถึงโครงการนี้");
		}
	}
}
