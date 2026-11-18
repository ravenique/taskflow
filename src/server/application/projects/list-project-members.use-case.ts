import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import type {
	GetProjectDetailInput,
	ListProjectMembersResultDto,
} from "#/shared/schemas/project.schema";
import type { AuthorizationService } from "../common/authorization.service";
import type { IProjectQueries } from "./project-queries.interface";

export interface ListProjectMembersUseCaseInput {
	actorUserId: string;
	actorSystemPermissions: readonly string[];
	payload: GetProjectDetailInput;
}

export class ListProjectMembersUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly projectQueries: IProjectQueries,
		private readonly authorizationService: AuthorizationService,
	) {}

	async execute(
		input: ListProjectMembersUseCaseInput,
	): Promise<ListProjectMembersResultDto> {
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

		return this.projectQueries.listProjectMembers(project.id);
	}
}
