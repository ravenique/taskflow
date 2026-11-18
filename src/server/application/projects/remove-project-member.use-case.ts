import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import {
	ProjectMemberNotFoundError,
	ProjectNotFoundError,
} from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { PROJECT_OWNER_ROLE_SLUG } from "#/server/domain/projects/project-member.entity";
import { PROJECT_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import type { RemoveProjectMemberInput } from "#/shared/schemas/project.schema";
import type { AuthorizationService } from "../common/authorization.service";

export interface RemoveProjectMemberUseCaseInput {
	actorUserId: string;
	payload: RemoveProjectMemberInput;
}

export class RemoveProjectMemberUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly authotizationService: AuthorizationService,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: RemoveProjectMemberUseCaseInput): Promise<void> {
		await this.unitOfWork.withTransaction(async () => {
			const project = await this.projectRepository.findById(
				input.payload.projectId,
			);
			if (!project) {
				throw new ProjectNotFoundError(input.payload.projectId);
			}

			const grantedPermissions =
				await this.projectRepository.getUserProjectPermissions(
					project.id,
					input.actorUserId,
				);
			this.authotizationService.assertProjectPermission(
				grantedPermissions,
				PROJECT_PERMISSIONS.PROJECT_MANAGE_MEMBERS,
			);

			project.ensureActiveForMemberManagement();

			const member = await this.projectRepository.findMemberById(
				project.id,
				input.payload.memberId,
			);
			if (!member) {
				throw new ProjectMemberNotFoundError(input.payload.memberId);
			}

			const ownerCount = await this.projectRepository.countMembersWithRoleSlug(
				project.id,
				PROJECT_OWNER_ROLE_SLUG,
			);
			member.ensureRemovable(ownerCount);

			const removed = await this.projectRepository.removeMember(
				project.id,
				member.id,
			);

			if (!removed) {
				throw new ProjectMemberNotFoundError(member.id);
			}

			await this.projectRepository.recordActivity({
				projectId: project.id,
				actorId: input.actorUserId,
				action: "project.member_removed",
				metadata: {
					targetUserId: member.userId,
					removedRoleSlug: member.roleSlug,
				},
			});
		});
	}
}
