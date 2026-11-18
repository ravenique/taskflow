import { AggregateRoot } from "#/server/domain/common/aggregate-root.base";
import { ValidationDomainError } from "#/server/domain/common/errors";
import type { TaskPriority, TaskStatus } from "#/shared/schemas/task.schema";
import {
	assertTaskStatusTransition,
	getAllowedTaskTransitions,
} from "./task-status.vo";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface TaskProps {
	readonly projectId: string;
	readonly code: string;
	readonly title: string;
	readonly description: string;
	readonly status: TaskStatus;
	readonly priority: TaskPriority;
	readonly assigneeId: string | null;
	readonly reporterId: string;
	readonly dueDate: Date | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface CreateTaskParams {
	readonly projectId: string;
	readonly code: string;
	readonly title: string;
	readonly description: string;
	readonly priority: TaskPriority;
	readonly assigneeId: string | null;
	readonly reporterId: string;
	readonly dueDate: string | null;
}

export interface UpdateTaskDetailsParams {
	readonly title: string;
	readonly description: string;
	readonly priority: TaskPriority;
	readonly dueDate: string | null;
}

export class Task extends AggregateRoot<TaskProps> {
	private constructor(id: string, props: TaskProps) {
		super(id, props);
	}

	static create(params: CreateTaskParams): Task {
		const validatedCode = params.code.trim();
		if (validatedCode.length === 0) {
			throw new ValidationDomainError("รหัส Task ต้องไม่ว่างเปล่า");
		}

		const now = new Date();

		return new Task(crypto.randomUUID(), {
			projectId: params.projectId,
			code: validatedCode,
			title: Task.validateTitle(params.title),
			description: Task.validateDescription(params.description),
			status: "todo",
			priority: params.priority,
			assigneeId: Task.normalizeAssigneeId(params.assigneeId),
			reporterId: params.reporterId,
			dueDate: Task.parseDueDate(params.dueDate),
			createdAt: now,
			updatedAt: now,
		});
	}

	static reconstitute(id: string, props: TaskProps): Task {
		return new Task(id, props);
	}

	get projectId(): string {
		return this.props.projectId;
	}

	get code(): string {
		return this.props.code;
	}

	get title(): string {
		return this.props.title;
	}

	get description(): string {
		return this.props.description;
	}

	get status(): TaskStatus {
		return this.props.status;
	}

	get priority(): TaskPriority {
		return this.props.priority;
	}

	get assigneeId(): string | null {
		return this.props.assigneeId;
	}

	get reporterId(): string {
		return this.props.reporterId;
	}

	get dueDate(): Date | null {
		return this.props.dueDate;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	getAllowedTransitions(): TaskStatus[] {
		return getAllowedTaskTransitions(this.props.status);
	}

	updateDetails(params: UpdateTaskDetailsParams): void {
		this.props = {
			...this.props,
			title: Task.validateTitle(params.title),
			description: Task.validateDescription(params.description),
			priority: params.priority,
			dueDate: Task.parseDueDate(params.dueDate),
			updatedAt: new Date(),
		};
	}

	transitionTo(nextStatus: TaskStatus): void {
		assertTaskStatusTransition(this.props.status, nextStatus);

		this.props = {
			...this.props,
			status: nextStatus,
			updatedAt: new Date(),
		};
	}

	assignTo(nextAssigneeId: string | null): void {
		const normalized = Task.normalizeAssigneeId(nextAssigneeId);
		this.props = {
			...this.props,
			assigneeId: normalized,
			updatedAt: new Date(),
		};
	}

	private static normalizeAssigneeId(assigneeId: string | null): string | null {
		if (assigneeId === null) {
			return null;
		}
		const trimmed = assigneeId.trim();
		return trimmed.length > 0 ? trimmed : null;
	}

	private static validateTitle(rawTitle: string): string {
		const trimmed = rawTitle.trim();
		if (trimmed.length < 2) {
			throw new ValidationDomainError("หัวข้อ Task ต้องมีอย่างน้อย 2 ตัวอักษร");
		}
		if (trimmed.length > 200) {
			throw new ValidationDomainError("หัวข้อ Task ต้องไม่เกิน 200 ตัวอักษร");
		}
		return trimmed;
	}

	private static validateDescription(rawDescription: string): string {
		const trimmed = rawDescription.trim();
		if (trimmed.length > 5000) {
			throw new ValidationDomainError("รายละเอียด Task ต้องไม่เกิน 5000 ตัวอักษร");
		}
		return trimmed;
	}

	private static parseDueDate(rawDueDate: string | null): Date | null {
		if (rawDueDate === null) {
			return null;
		}
		const trimmed = rawDueDate.trim();
		if (trimmed.length === 0) {
			return null;
		}

		const dateOnlyMatch = DATE_ONLY_PATTERN.exec(trimmed);
		if (dateOnlyMatch) {
			const year = Number(dateOnlyMatch[1]);
			const month = Number(dateOnlyMatch[2]);
			const day = Number(dateOnlyMatch[3]);
			const parsedUtc = new Date(Date.UTC(year, month - 1, day));
			if (
				parsedUtc.getUTCFullYear() !== year ||
				parsedUtc.getUTCMonth() + 1 !== month ||
				parsedUtc.getUTCDate() !== day
			) {
				throw new ValidationDomainError("วันที่ครบกำหนดไม่ถูกต้องตามปฏิทิน");
			}
			return parsedUtc;
		}

		const parsed = new Date(trimmed);
		if (Number.isNaN(parsed.getTime())) {
			throw new ValidationDomainError("รูปแบบวันครบกำหนดไม่ถูกต้อง");
		}
		return parsed;
	}
}
