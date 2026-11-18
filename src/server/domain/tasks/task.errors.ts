import {
	ForbiddenDomainError,
	InvalidStateTransitionError,
	NotFoundDomainError,
	ValidationDomainError,
} from "#/server/domain/common/errors";
import type { TaskStatus } from "#/shared/schemas/task.schema";

export class TaskNotFoundError extends NotFoundDomainError {
	constructor(identifier: string) {
		super(`ไม่พบงานที่ระบุ (${identifier})`);
	}
}

export class TaskCommentNotFoundError extends NotFoundDomainError {
	constructor(commentId: string) {
		super(`ไม่พบความคิดเห็นที่ระบุ (${commentId})`);
	}
}

export class InvalidTaskStatusTransitionError extends InvalidStateTransitionError {
	constructor(
		fromStatus: TaskStatus,
		toStatus: TaskStatus,
		customMessage?: string,
	) {
		super(
			customMessage ??
				`ไม่สามารถเปลี่ยนสถานะงานจาก '${fromStatus}' เป็น '${toStatus}' ได้`,
		);
	}
}

export class InvalidTaskAssigneeError extends ValidationDomainError {
	constructor(userId: string) {
		super(`ผู้ใช้งาน (${userId}) ไม่ได้เป็นสมาชิกของโครงการนี้ จึงไม่สามารถมอบหมายงานได้`);
	}
}

export class TaskCommentDeletionForbiddenError extends ForbiddenDomainError {
	constructor() {
		super(
			"คุณไม่มีสิทธิ์ลบความคิดเห็นของผู้ใช้อื่น (ต้องเป็นเจ้าของหรือมีสิทธิ์ comment:delete_any)",
		);
	}
}
