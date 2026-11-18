import type { Project } from "#/server/domain/projects/project.entity";
import type { ProjectDto } from "#/shared/schemas/project.schema";

export class ProjectMapper {
	static toDto(project: Project): ProjectDto {
		return {
			id: project.id,
			key: project.key.value,
			name: project.name,
			description: project.description,
			status: project.status,
			taskSequence: project.taskSequence,
			createdById: project.createdById,
			createdAt: project.createdAt.toISOString(),
			updatedAt: project.updatedAt.toISOString(),
		};
	}
}
