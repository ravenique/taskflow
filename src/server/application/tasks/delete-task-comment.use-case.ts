import type { AuthorizationService } from "#/server/application/common/authorization.service";
import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { PROJECT_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import {
	TaskCommentNotFoundError,
	TaskNotFoundError,
} from "#/server/domain/tasks/task.errors";
import type { ITaskRepository } from "#/server/domain/tasks/task.repository";
import type { DeleteTaskCommentInput } from "#/shared/schemas/task.schema";

export interface DeleteTaskCommentUseCaseInput {
	actorUserId: string;
	payload: DeleteTaskCommentInput;
}

export class DeleteTaskCommentUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly taskRepository: ITaskRepository,
		private readonly authorizationService: AuthorizationService,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(
		input: DeleteTaskCommentUseCaseInput,
	): Promise<{ deleted: true }> {
		return this.unitOfWork.withTransaction(async () => {
			const [project, projectPermissions, task, comment] = await Promise.all([
				this.projectRepository.findById(input.payload.projectId),
				this.projectRepository.getUserProjectPermissions(
					input.payload.projectId,
					input.actorUserId,
				),
				this.taskRepository.findById(
					input.payload.projectId,
					input.payload.taskId,
				),
				this.taskRepository.findCommentById(
					input.payload.projectId,
					input.payload.taskId,
					input.payload.commentId,
				),
			]);

			if (!project) {
				throw new ProjectNotFoundError(input.payload.projectId);
			}

			this.authorizationService.assertProjectPermission(
				projectPermissions,
				PROJECT_PERMISSIONS.PROJECT_READ,
			);
			project.ensureActiveForTaskMutation();

			if (!task) {
				throw new TaskNotFoundError(input.payload.taskId);
			}

			if (!comment) {
				throw new TaskCommentNotFoundError(input.payload.commentId);
			}

			const canDeleteAny = this.authorizationService.hasProjectPermission(
				projectPermissions,
				PROJECT_PERMISSIONS.COMMENT_DELETE_ANY,
			);
			comment.ensureDeletableBy(input.actorUserId, canDeleteAny);

			const deleted = await this.taskRepository.deleteComment(
				task.id,
				comment.id,
			);
			if (!deleted) {
				throw new TaskCommentNotFoundError(comment.id);
			}

			await this.projectRepository.recordActivity({
				projectId: project.id,
				taskId: task.id,
				actorId: input.actorUserId,
				action: "task.comment_deleted",
				metadata: {
					code: task.code,
					commentId: comment.id,
				},
			});

			return { deleted: true };
		});
	}
}
