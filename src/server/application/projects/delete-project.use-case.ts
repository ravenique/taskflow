import type { AuthorizationService } from "#/server/application/common/authorization.service";
import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { PROJECT_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import type { ProjectActionInput } from "#/shared/schemas/project.schema";

export interface DeleteProjectUseCaseInput {
	actorUserId: string;
	payload: ProjectActionInput;
}

export class DeleteProjectUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly authorizationService: AuthorizationService,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: DeleteProjectUseCaseInput): Promise<void> {
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
				PROJECT_PERMISSIONS.PROJECT_DELETE,
			);

			const deleted = await this.projectRepository.delete(project.id);
			if (!deleted) {
				throw new ProjectNotFoundError(project.id);
			}
		});
	}
}
