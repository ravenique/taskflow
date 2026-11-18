import type { AuthorizationService } from "#/server/application/common/authorization.service";
import type { IUserQueries } from "#/server/application/users/user-queries.interface";
import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import {
	InvalidProjectRoleError,
	ProjectMemberAlreadyExistsError,
	ProjectNotFoundError,
} from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { ProjectMember } from "#/server/domain/projects/project-member.entity";
import { PROJECT_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import { RoleNotFoundError } from "#/server/domain/rbac/rbac.errors";
import type { IRbacRepository } from "#/server/domain/rbac/rbac.repository";
import { UserNotFoundError } from "#/server/domain/users/user.errors";
import type { AddProjectMemberInput } from "#/shared/schemas/project.schema";

export interface AddProjectMemberUseCaseInput {
	actorUserId: string;
	payload: AddProjectMemberInput;
}

export class AddProjectMemberUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly rbacRepository: IRbacRepository,
		private readonly userQueries: IUserQueries,
		private readonly authorizationService: AuthorizationService,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: AddProjectMemberUseCaseInput): Promise<void> {
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

			const userExists = await this.userQueries.existsById(
				input.payload.userId,
			);
			if (!userExists) {
				throw new UserNotFoundError(input.payload.userId);
			}

			const existingMember = await this.projectRepository.findMemberByUserId(
				project.id,
				input.payload.userId,
			);
			if (existingMember) {
				throw new ProjectMemberAlreadyExistsError();
			}

			const role = await this.rbacRepository.findRoleById(input.payload.roleId);
			if (!role) {
				throw new RoleNotFoundError(input.payload.roleId);
			}
			if (role.scope !== "project") {
				throw new InvalidProjectRoleError();
			}

			const member = ProjectMember.create({
				projectId: project.id,
				userId: input.payload.userId,
				roleId: role.id,
				roleSlug: role.slug,
			});

			await this.projectRepository.saveMember(member);

			await this.projectRepository.recordActivity({
				projectId: project.id,
				actorId: input.actorUserId,
				action: "project.member_added",
				metadata: {
					targetUserId: member.userId,
					roleSlug: role.slug,
					roleName: role.name,
				},
			});
		});
	}
}
