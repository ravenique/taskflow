import type { AuthorizationService } from "#/server/application/common/authorization.service";
import { ProjectMapper } from "#/server/application/mappers/project.mapper";
import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { PROJECT_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import type {
	ProjectActionInput,
	ProjectDto,
} from "#/shared/schemas/project.schema";

export interface ArchiveProjectUseCaseInput {
	actorUserId: string;
	payload: ProjectActionInput;
}

export class ArchiveProjectUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly authorizationService: AuthorizationService,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: ArchiveProjectUseCaseInput): Promise<ProjectDto> {
		return this.unitOfWork.withTransaction(async () => {
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
				PROJECT_PERMISSIONS.PROJECT_UPDATE,
			);

			project.archive();
			await this.projectRepository.save(project);

			await this.projectRepository.recordActivity({
				projectId: project.id,
				actorId: input.actorUserId,
				action: "project.archived",
				metadata: { key: project.key.value },
			});

			return ProjectMapper.toDto(project);
		});
	}
}
