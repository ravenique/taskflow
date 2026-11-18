import type { AuthorizationService } from "#/server/application/common/authorization.service";
import { ProjectMapper } from "#/server/application/mappers/project.mapper";
import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { PROJECT_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import type {
	ProjectDto,
	UpdateProjectInput,
} from "#/shared/schemas/project.schema";

export interface UpdateProjectUseCaseInput {
	actorUserId: string;
	payload: UpdateProjectInput;
}

export class UpdateProjectUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly authorizationService: AuthorizationService,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: UpdateProjectUseCaseInput): Promise<ProjectDto> {
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

			project.updateDetails(input.payload.name, input.payload.description);
			await this.projectRepository.save(project);

			await this.projectRepository.recordActivity({
				projectId: project.id,
				actorId: input.actorUserId,
				action: "project.updated",
				metadata: {
					name: project.name,
				},
			});

			return ProjectMapper.toDto(project);
		});
	}
}
