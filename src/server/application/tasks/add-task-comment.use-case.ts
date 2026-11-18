import type { AuthorizationService } from "#/server/application/common/authorization.service";
import { TaskMapper } from "#/server/application/mappers/task.mapper";
import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { PROJECT_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import { TaskNotFoundError } from "#/server/domain/tasks/task.errors";
import type { ITaskRepository } from "#/server/domain/tasks/task.repository";
import { TaskComment } from "#/server/domain/tasks/task-comment.entity";
import type {
	AddTaskCommentInput,
	TaskCommentDto,
	TaskUserSummary,
} from "#/shared/schemas/task.schema";

export interface AddTaskCommentUseCaseInput {
	actor: TaskUserSummary;
	payload: AddTaskCommentInput;
}

export class AddTaskCommentUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly taskRepository: ITaskRepository,
		private readonly authorizationService: AuthorizationService,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: AddTaskCommentUseCaseInput): Promise<TaskCommentDto> {
		return this.unitOfWork.withTransaction(async () => {
			const [project, projectPermissions, task] = await Promise.all([
				this.projectRepository.findById(input.payload.projectId),
				this.projectRepository.getUserProjectPermissions(
					input.payload.projectId,
					input.actor.id,
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
				PROJECT_PERMISSIONS.COMMENT_CREATE,
			);
			project.ensureActiveForTaskMutation();

			if (!task) {
				throw new TaskNotFoundError(input.payload.taskId);
			}

			const comment = TaskComment.create({
				taskId: task.id,
				authorId: input.actor.id,
				body: input.payload.body,
			});

			await this.taskRepository.saveComment(comment);
			await this.projectRepository.recordActivity({
				projectId: project.id,
				taskId: task.id,
				actorId: input.actor.id,
				action: "task.comment_added",
				metadata: {
					code: task.code,
					commentId: comment.id,
				},
			});

			return TaskMapper.toCommentDto(comment, input.actor);
		});
	}
}
