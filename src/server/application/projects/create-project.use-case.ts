import { ProjectMapper } from "#/server/application/mappers/project.mapper";
import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import { Project } from "#/server/domain/projects/project.entity";
import { ProjectKeyAlreadyExistsError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { RoleNotFoundError } from "#/server/domain/rbac/rbac.errors";
import type { IRbacRepository } from "#/server/domain/rbac/rbac.repository";
import type {
	CreateProjectInput,
	ProjectDto,
} from "#/shared/schemas/project.schema";

const PROJECT_OWNER_ROLE_SLUG = "project_owner";

export interface CreateProjectUseCaseInput {
	actorUserId: string;
	payload: CreateProjectInput;
}

export class CreateProjectUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly rbacRepository: IRbacRepository,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: CreateProjectUseCaseInput): Promise<ProjectDto> {
		const project = Project.create({
			key: input.payload.key,
			name: input.payload.name,
			description: input.payload.description,
			createdById: input.actorUserId,
		});

		return this.unitOfWork.withTransaction(async () => {
			const existing = await this.projectRepository.findByKey(
				project.key.value,
			);
			if (existing) {
				throw new ProjectKeyAlreadyExistsError(project.key.value);
			}

			const ownerRole = await this.rbacRepository.findRoleBySlug(
				PROJECT_OWNER_ROLE_SLUG,
			);
			if (!ownerRole) {
				throw new RoleNotFoundError(PROJECT_OWNER_ROLE_SLUG);
			}

			await this.projectRepository.save(project);

			await this.projectRepository.addMember({
				id: crypto.randomUUID(),
				projectId: project.id,
				userId: input.actorUserId,
				roleId: ownerRole.id,
			});

			await this.projectRepository.recordActivity({
				projectId: project.id,
				actorId: input.actorUserId,
				action: "project.created",
				metadata: {
					key: project.key.value,
					name: project.name,
				},
			});

			return ProjectMapper.toDto(project);
		});
	}
}
