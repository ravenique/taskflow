import { AggregateRoot } from "#/server/domain/common/aggregate-root.base";
import { ValidationDomainError } from "#/server/domain/common/errors";
import type { ProjectStatus } from "#/shared/schemas/project.schema";
import {
	ProjectAlreadyActiveError,
	ProjectArchivedError,
} from "./project.errors";
import { ProjectKey } from "./project-key.vo";

export interface ProjectProps {
	readonly key: ProjectKey;
	readonly name: string;
	readonly description: string;
	readonly status: ProjectStatus;
	readonly taskSequence: number;
	readonly createdById: string;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface CreateProjectParams {
	readonly key: string;
	readonly name: string;
	readonly description: string;
	readonly createdById: string;
}

export class Project extends AggregateRoot<ProjectProps> {
	private constructor(id: string, props: ProjectProps) {
		super(id, props);
	}

	static create(params: CreateProjectParams): Project {
		const projectKey = ProjectKey.create(params.key);
		const validatedName = Project.validateName(params.name);
		const validatedDescription = Project.validateDescription(
			params.description,
		);
		const now = new Date();

		return new Project(crypto.randomUUID(), {
			key: projectKey,
			name: validatedName,
			description: validatedDescription,
			status: "active",
			taskSequence: 0,
			createdById: params.createdById,
			createdAt: now,
			updatedAt: now,
		});
	}

	static reconstitute(id: string, props: ProjectProps): Project {
		return new Project(id, props);
	}

	get key(): ProjectKey {
		return this.props.key;
	}

	get name(): string {
		return this.props.name;
	}

	get description(): string {
		return this.props.description;
	}

	get status(): ProjectStatus {
		return this.props.status;
	}

	get taskSequence(): number {
		return this.props.taskSequence;
	}

	get createdById(): string {
		return this.props.createdById;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	updateDetails(name: string, description: string): void {
		if (this.props.status === "archived") {
			throw new ProjectArchivedError(
				"ไม่สามารถแก้ไขรายละเอียดโครงการที่ถูกจัดเก็บแล้ว กรุณากู้คืนก่อน",
			);
		}

		this.props = {
			...this.props,
			name: Project.validateName(name),
			description: Project.validateDescription(description),
			updatedAt: new Date(),
		};
	}

	archive(): void {
		if (this.props.status === "archived") {
			throw new ProjectArchivedError("โครงการนี้ถูกจัดเก็บไว้แล้ว");
		}

		this.props = {
			...this.props,
			status: "archived",
			updatedAt: new Date(),
		};
	}

	restore(): void {
		if (this.props.status === "active") {
			throw new ProjectAlreadyActiveError();
		}

		this.props = {
			...this.props,
			status: "active",
			updatedAt: new Date(),
		};
	}

	ensureActiveForMemberManagement(): void {
		if (this.props.status === "archived") {
			throw new ProjectArchivedError(
				"ไม่สามารถจัดการสมาชิกในโครงการที่ถูกจัดเก็บแล้วได้ กรุณากู้คืนโครงการก่อน",
			);
		}
	}

	ensureActiveForTaskMutation(): void {
		if (this.props.status === "archived") {
			throw new ProjectArchivedError(
				"ไม่สามารถสร้าง แก้ไข หรือดำเนินการกับงานในโครงการที่ถูกจัดเก็บแล้วได้ กรุณากู้คืนโครงการก่อน",
			);
		}
	}

	private static validateName(rawName: string): string {
		const trimmed = rawName.trim();
		if (trimmed.length < 2 || trimmed.length > 150) {
			throw new ValidationDomainError(
				"ชื่อโครงการต้องมีความยาวระหว่าง 2–150 ตัวอักษร",
			);
		}
		return trimmed;
	}

	private static validateDescription(rawDescription: string): string {
		const trimmed = rawDescription.trim();
		if (trimmed.length > 1000) {
			throw new ValidationDomainError("คำอธิบายโครงการต้องไม่เกิน 1000 ตัวอักษร");
		}
		return trimmed;
	}
}
