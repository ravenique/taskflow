import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import {
	InvalidProjectRoleError,
	ProjectMemberNotFoundError,
	ProjectNotFoundError,
} from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { PROJECT_OWNER_ROLE_SLUG } from "#/server/domain/projects/project-member.entity";
import { PROJECT_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import { RoleNotFoundError } from "#/server/domain/rbac/rbac.errors";
import type { IRbacRepository } from "#/server/domain/rbac/rbac.repository";
import type { ChangeProjectMemberRoleInput } from "#/shared/schemas/project.schema";
import type { AuthorizationService } from "../common/authorization.service";

export interface ChangeProjectMemberRoleUseCaseInput {
	actorUserId: string;
	payload: ChangeProjectMemberRoleInput;
}

export class ChangeProjectMemberRoleUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly rbacRepository: IRbacRepository,
		private readonly authorizationService: AuthorizationService,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: ChangeProjectMemberRoleUseCaseInput): Promise<void> {
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
			this.authorizationService.assertProjectPermission(
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

			const nextRole = await this.rbacRepository.findRoleById(
				input.payload.roleId,
			);
			if (!nextRole) {
				throw new RoleNotFoundError(input.payload.roleId);
			}
			if (nextRole.scope !== "project") {
				throw new InvalidProjectRoleError();
			}

			const previousRoleSlug = member.roleSlug;
			const ownerCount = await this.projectRepository.countMembersWithRoleSlug(
				project.id,
				PROJECT_OWNER_ROLE_SLUG,
			);

			member.changeRole(nextRole.id, nextRole.slug, ownerCount);
			await this.projectRepository.saveMember(member);

			await this.projectRepository.recordActivity({
				projectId: project.id,
				actorId: input.actorUserId,
				action: "project.member_role_changed",
				metadata: {
					targetUserId: member.userId,
					previousRoleSlug,
					nextRoleSlug: nextRole.slug,
					nextRoleName: nextRole.name,
				},
			});
		});
	}
}
