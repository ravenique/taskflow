import { Entity } from "#/server/domain/common/entity.base";
import { ValidationDomainError } from "#/server/domain/common/errors";
import { TaskCommentDeletionForbiddenError } from "./task.errors";

export interface TaskCommentProps {
	readonly taskId: string;
	readonly authorId: string;
	readonly body: string;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface CreateTaskCommentParams {
	readonly taskId: string;
	readonly authorId: string;
	readonly body: string;
}

export class TaskComment extends Entity<TaskCommentProps> {
	private constructor(id: string, props: TaskCommentProps) {
		super(id, props);
	}

	static create(params: CreateTaskCommentParams): TaskComment {
		const validatedBody = TaskComment.validateBody(params.body);
		const now = new Date();

		return new TaskComment(crypto.randomUUID(), {
			taskId: params.taskId,
			authorId: params.authorId,
			body: validatedBody,
			createdAt: now,
			updatedAt: now,
		});
	}

	static reconstitute(id: string, props: TaskCommentProps): TaskComment {
		return new TaskComment(id, props);
	}

	get taskId(): string {
		return this.props.taskId;
	}

	get authorId(): string {
		return this.props.authorId;
	}

	get body(): string {
		return this.props.body;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	ensureDeletableBy(actorUserId: string, canDeleteAny: boolean): void {
		if (this.props.authorId === actorUserId || canDeleteAny) {
			return;
		}
		throw new TaskCommentDeletionForbiddenError();
	}

	private static validateBody(rawBody: string): string {
		const trimmed = rawBody.trim();
		if (trimmed.length === 0) {
			throw new ValidationDomainError("กรุณากรอกข้อความความคิดเห็น");
		}
		if (trimmed.length > 3000) {
			throw new ValidationDomainError("ความคิดเห็นต้องไม่เกิน 3000 ตัวอักษร");
		}
		return trimmed;
	}
}
