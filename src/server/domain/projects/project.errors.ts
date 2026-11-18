import {
	ConflictDomainError,
	ForbiddenDomainError,
	InvalidStateTransitionError,
	NotFoundDomainError,
	ValidationDomainError,
} from "#/server/domain/common/errors";

export class InvalidProjectKeyError extends ValidationDomainError {
	constructor(rawKey: string) {
		super(
			`รหัสโครงการ '${rawKey}' ไม่ถูกต้อง ต้องเป็นตัวอักษร A-Z และตัวเลข 0-9 ความยาว 2–10 ตัวอักษร และขึ้นต้นด้วย A-Z`,
		);
	}
}

export class ProjectKeyAlreadyExistsError extends ConflictDomainError {
	constructor(key: string) {
		super(`รหัสโครงการ '${key}' ถูกใช้งานแล้ว กรุณาใช้รหัสอื่น`);
	}
}

export class ProjectNotFoundError extends NotFoundDomainError {
	constructor(identifier: string) {
		super(`ไม่พบโครงการที่ระบุ (${identifier})`);
	}
}

export class ProjectArchivedError extends InvalidStateTransitionError {
	constructor(message = "โครงการนี้อยู่ในสถานะถูกจัดเก็บ ไม่สามารถแก้ไขได้") {
		super(message);
	}
}

export class ProjectAlreadyActiveError extends InvalidStateTransitionError {
	constructor() {
		super("โครงการนี้อยู่ในสถานะใช้งานอยู่แล้ว");
	}
}

export class ProjectMemberAlreadyExistsError extends ConflictDomainError {
	constructor() {
		super("ผู้ใช้งานนี้เป็นสมาชิกของโปรเจกต์นี้อยู่แล้ว");
	}
}

export class ProjectMemberNotFoundError extends NotFoundDomainError {
	constructor(memberId: string) {
		super(`ไม่พบสมาชิกที่ระบุภายในโปรเจกต์ (${memberId})`);
	}
}

export class LastProjectOwnerError extends ForbiddenDomainError {
	constructor(
		message = "ไม่สามารถถอดหรือลดบทบาท Project Owner คนสุดท้ายของโปรเจกต์ได้",
	) {
		super(message);
	}
}

export class InvalidProjectRoleError extends ValidationDomainError {
	constructor() {
		super("สามารถมอบหมายได้เฉพาะ Role ระดับ 'project' ให้สมาชิกภายในโปรเจกต์เท่านั้น");
	}
}
