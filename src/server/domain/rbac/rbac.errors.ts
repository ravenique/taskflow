import type { PermissionCode, RoleScope } from "#/shared/schemas/rbac.schema";
import {
	ConflictDomainError,
	ForbiddenDomainError,
	NotFoundDomainError,
	ValidationDomainError,
} from "../common/errors";

export class RoleNotFoundError extends NotFoundDomainError {
	constructor(identifier: string) {
		super(`ไม่พบบทบาทที่ระบุ (${identifier})`);
	}
}

export class RoleSlugAlreadyExistsError extends ConflictDomainError {
	constructor(slug: string) {
		super(`รหัสอ้างอิง '${slug}' ถูกใช้งานแล้ว กรุณาใช้รหัสอ้างอิงอื่น`);
	}
}

export class SystemRoleImmutableError extends ForbiddenDomainError {
	constructor(message: string) {
		super(message);
	}
}

export class PermissionScopeMismatchError extends ValidationDomainError {
	constructor(permissionCode: PermissionCode, targetScope: RoleScope) {
		super(
			`ไม่สามารถผูกสิทธิ์ '${permissionCode}' เข้ากับบทบาทระดับ '${targetScope}' ได้`,
		);
	}
}

export class UnknowPermissionError extends NotFoundDomainError {
	constructor() {
		super("พบสิทธิ์การเข้าถึงบางรายการที่ไม่มีอยู่ในระบบ");
	}
}

export class RoleInUseError extends ConflictDomainError {
	constructor() {
		super("ไม่สามารถลบบทบาทนี้ได้ เนื่องจากยังมีผู้ใช้งานหรือสมาชิกในโครงการถือสิทธิ์นี้อยู่");
	}
}
