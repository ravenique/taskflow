import type { AuthorizationService } from "#/server/application/common/authorization.service";
import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { TaskNotFoundError } from "#/server/domain/tasks/task.errors";
import type {
	GetTaskDetailInput,
	TaskDetailDto,
} from "#/shared/schemas/task.schema";
import type { ITaskQueries } from "./task-queries.interface";

export interface GetTaskDetailUseCaseInput {
	actorUserId: string;
	actorSystemPermissions: readonly string[];
	payload: GetTaskDetailInput;
}

export class GetTaskDetailUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly taskQueries: ITaskQueries,
		private readonly authorizationService: AuthorizationService,
	) {}

	async execute(input: GetTaskDetailUseCaseInput): Promise<TaskDetailDto> {
		const [project, projectPermissions, detail] = await Promise.all([
			this.projectRepository.findById(input.payload.projectId),
			this.projectRepository.getUserProjectPermissions(
				input.payload.projectId,
				input.actorUserId,
			),
			this.taskQueries.findTaskDetailById(
				input.payload.projectId,
				input.payload.taskId,
			),
		]);

		if (!project) {
			throw new ProjectNotFoundError(input.payload.projectId);
		}

		this.authorizationService.assertProjectReadAccess(
			input.actorSystemPermissions,
			projectPermissions,
		);

		if (!detail) {
			throw new TaskNotFoundError(input.payload.taskId);
		}

		return detail;
	}
}
