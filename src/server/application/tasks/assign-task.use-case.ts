import type { AuthorizationService } from "#/server/application/common/authorization.service";
import { TaskMapper } from "#/server/application/mappers/task.mapper";
import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { PROJECT_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import {
	InvalidTaskAssigneeError,
	TaskNotFoundError,
} from "#/server/domain/tasks/task.errors";
import type { ITaskRepository } from "#/server/domain/tasks/task.repository";
import type { AssignTaskInput, TaskDto } from "#/shared/schemas/task.schema";

export interface AssignTaskUseCaseInput {
	actorUserId: string;
	payload: AssignTaskInput;
}

export class AssignTaskUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly taskRepository: ITaskRepository,
		private readonly authorizationService: AuthorizationService,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: AssignTaskUseCaseInput): Promise<TaskDto> {
		return this.unitOfWork.withTransaction(async () => {
			const [project, projectPermissions, task] = await Promise.all([
				this.projectRepository.findById(input.payload.projectId),
				this.projectRepository.getUserProjectPermissions(
					input.payload.projectId,
					input.actorUserId,
				),
				this.taskRepository.findById(
					input.payload.projectId,
					input.payload.taskId,
				),
			]);

			if (!project) {
				throw new ProjectNotFoundError(input.payload.projectId);
			}

			this.authorizationService.assertProjectPermission(
				projectPermissions,
				PROJECT_PERMISSIONS.TASK_ASSIGN,
			);
			project.ensureActiveForTaskMutation();

			if (!task) {
				throw new TaskNotFoundError(input.payload.taskId);
			}

			const nextAssigneeId = input.payload.assigneeId;
			if (nextAssigneeId !== null) {
				const member = await this.projectRepository.findMemberByUserId(
					project.id,
					nextAssigneeId,
				);
				if (!member) {
					throw new InvalidTaskAssigneeError(nextAssigneeId);
				}
			}

			const previousAssigneeId = task.assigneeId;
			if (previousAssigneeId === nextAssigneeId) {
				return TaskMapper.toDto(task);
			}

			task.assignTo(nextAssigneeId);

			await this.taskRepository.save(task);
			await this.projectRepository.recordActivity({
				projectId: project.id,
				taskId: task.id,
				actorId: input.actorUserId,
				action: "task.assigned",
				metadata: {
					code: task.code,
					previousAssigneeId,
					nextAssigneeId: task.assigneeId,
				},
			});

			return TaskMapper.toDto(task);
		});
	}
}
