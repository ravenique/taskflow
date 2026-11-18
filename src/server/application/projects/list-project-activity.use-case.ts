import type { AuthorizationService } from "#/server/application/common/authorization.service";
import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import type {
	ActivityLogDto,
	ListProjectActivityInput,
} from "#/shared/schemas/project.schema";
import type { IProjectQueries } from "./project-queries.interface";

export interface ListProjectActivityUseCaseInput {
	actorUserId: string;
	actorSystemPermissions: readonly string[];
	payload: ListProjectActivityInput;
}

export class ListProjectActivityUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly projectQueries: IProjectQueries,
		private readonly authorizationService: AuthorizationService,
	) {}

	async execute(
		input: ListProjectActivityUseCaseInput,
	): Promise<ActivityLogDto[]> {
		const [project, projectPermissions] = await Promise.all([
			this.projectRepository.findById(input.payload.projectId),
			this.projectRepository.getUserProjectPermissions(
				input.payload.projectId,
				input.actorUserId,
			),
		]);

		if (!project) {
			throw new ProjectNotFoundError(input.payload.projectId);
		}

		this.authorizationService.assertProjectReadAccess(
			input.actorSystemPermissions,
			projectPermissions,
		);

		return this.projectQueries.listProjectActivity(
			project.id,
			input.payload.limit,
		);
	}
}
