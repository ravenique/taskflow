import { Entity } from "#/server/domain/common/entity.base";
import { LastProjectOwnerError } from "./project.errors";

export const PROJECT_OWNER_ROLE_SLUG = "project_owner";

export interface ProjectMemberProps {
	readonly projectId: string;
	readonly userId: string;
	readonly roleId: string;
	readonly roleSlug: string;
	readonly joinedAt: Date;
}

export interface CreateProjectMemberParams {
	readonly projectId: string;
	readonly userId: string;
	readonly roleId: string;
	readonly roleSlug: string;
}

export class ProjectMember extends Entity<ProjectMemberProps> {
	private constructor(id: string, props: ProjectMemberProps) {
		super(id, props);
	}

	static create(params: CreateProjectMemberParams): ProjectMember {
		return new ProjectMember(crypto.randomUUID(), {
			projectId: params.projectId,
			userId: params.userId,
			roleId: params.roleId,
			roleSlug: params.roleSlug,
			joinedAt: new Date(),
		});
	}

	static reconstitute(id: string, props: ProjectMemberProps): ProjectMember {
		return new ProjectMember(id, props);
	}

	get projectId(): string {
		return this.props.projectId;
	}

	get userId(): string {
		return this.props.userId;
	}

	get roleId(): string {
		return this.props.roleId;
	}

	get roleSlug(): string {
		return this.props.roleSlug;
	}

	get joinedAt(): Date {
		return this.props.joinedAt;
	}

	isOwner(): boolean {
		return this.props.roleSlug === PROJECT_OWNER_ROLE_SLUG;
	}

	changeRole(
		nextRoleId: string,
		nextRoleSlug: string,
		ownerCount: number,
	): void {
		if (
			this.isOwner() &&
			nextRoleSlug !== PROJECT_OWNER_ROLE_SLUG &&
			ownerCount <= 1
		) {
			throw new LastProjectOwnerError(
				"ไม่สามารถเปลี่ยนบทบาทของเจ้าของโครงการคนสุดท้ายได้ กรุณาตั้งเจ้าของโครงการคนอื่นเพิ่มก่อน",
			);
		}

		this.props = {
			...this.props,
			roleId: nextRoleId,
			roleSlug: nextRoleSlug,
		};
	}

	ensureRemovable(ownerCount: number): void {
		if (this.isOwner() && ownerCount <= 1) {
			throw new LastProjectOwnerError(
				"ไม่สามารถลบเจ้าของโครงการคนสุดท้ายออกจากโครงการได้",
			);
		}
	}
}
