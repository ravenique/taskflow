import type { AuthorizationService } from "#/server/application/common/authorization.service";
import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { PROJECT_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import { TaskNotFoundError } from "#/server/domain/tasks/task.errors";
import type { ITaskRepository } from "#/server/domain/tasks/task.repository";
import type { DeleteTaskInput } from "#/shared/schemas/task.schema";

export interface DeleteTaskUseCaseInput {
	actorUserId: string;
	payload: DeleteTaskInput;
}

export class DeleteTaskUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly taskRepository: ITaskRepository,
		private readonly authorizationService: AuthorizationService,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: DeleteTaskUseCaseInput): Promise<{ deleted: true }> {
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
				PROJECT_PERMISSIONS.TASK_DELETE,
			);
			project.ensureActiveForTaskMutation();

			if (!task) {
				throw new TaskNotFoundError(input.payload.taskId);
			}

			const deleted = await this.taskRepository.delete(project.id, task.id);
			if (!deleted) {
				throw new TaskNotFoundError(task.id);
			}

			// บันทึก taskId: null หลังลบเพื่อป้องกัน FK constraint violation ขณะคงรหัสไว้ใน Audit Trail
			await this.projectRepository.recordActivity({
				projectId: project.id,
				taskId: null,
				actorId: input.actorUserId,
				action: "task.deleted",
				metadata: {
					code: task.code,
					title: task.title,
				},
			});

			return { deleted: true };
		});
	}
}
