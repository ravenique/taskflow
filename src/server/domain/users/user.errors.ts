import { ForbiddenDomainError, NotFoundDomainError } from "../common/errors";

export class UserNotFoundError extends NotFoundDomainError {
	constructor(userId: string) {
		super(`ไม่พบบัญชีผู้ใช้งาน (${userId})`);
	}
}

export class SelfRoleLockoutError extends ForbiddenDomainError {
	constructor() {
		super(
			"ไม่สามารถบันทึกรายการเปลี่ยนแปลงได้ เนื่องจากจะทำให้บัญชีของคุณเองสูญเสียสิทธิ์ 'user:assign_role'",
		);
	}
}
