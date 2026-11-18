import type { AuthorizationService } from "#/server/application/common/authorization.service";
import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import type {
	ListTasksInput,
	ListTasksResultDto,
} from "#/shared/schemas/task.schema";
import type { ITaskQueries } from "./task-queries.interface";

export interface ListTasksUseCaseInput {
	actorUserId: string;
	actorSystemPermissions: readonly string[];
	payload: ListTasksInput;
}

export class ListTasksUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly taskQueries: ITaskQueries,
		private readonly authorizationService: AuthorizationService,
	) {}

	async execute(input: ListTasksUseCaseInput): Promise<ListTasksResultDto> {
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

		return this.taskQueries.listTasks(project.id, input.payload.params);
	}
}
