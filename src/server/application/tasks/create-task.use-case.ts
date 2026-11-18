import type { AuthorizationService } from "#/server/application/common/authorization.service";
import { TaskMapper } from "#/server/application/mappers/task.mapper";
import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type { IProjectRepository } from "#/server/domain/projects/project.repository";
import { PROJECT_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import { Task } from "#/server/domain/tasks/task.entity";
import { InvalidTaskAssigneeError } from "#/server/domain/tasks/task.errors";
import type { ITaskRepository } from "#/server/domain/tasks/task.repository";
import type { CreateTaskInput, TaskDto } from "#/shared/schemas/task.schema";

export interface CreateTaskUseCaseInput {
	actorUserId: string;
	payload: CreateTaskInput;
}

export class CreateTaskUseCase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly taskRepository: ITaskRepository,
		private readonly authorizationService: AuthorizationService,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: CreateTaskUseCaseInput): Promise<TaskDto> {
		return this.unitOfWork.withTransaction(async () => {
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

			this.authorizationService.assertProjectPermission(
				projectPermissions,
				PROJECT_PERMISSIONS.TASK_CREATE,
			);
			project.ensureActiveForTaskMutation();

			const assigneeId = input.payload.assigneeId;
			if (assigneeId !== null) {
				this.authorizationService.assertProjectPermission(
					projectPermissions,
					PROJECT_PERMISSIONS.TASK_ASSIGN,
				);

				const assigneeMember = await this.projectRepository.findMemberByUserId(
					project.id,
					assigneeId,
				);
				if (!assigneeMember) {
					throw new InvalidTaskAssigneeError(assigneeId);
				}
			}

			const nextSequence = await this.projectRepository.incrementTaskSequence(
				project.id,
			);
			const code = `${project.key.value}-${nextSequence}`;

			const task = Task.create({
				projectId: project.id,
				code,
				title: input.payload.title,
				description: input.payload.description,
				priority: input.payload.priority,
				assigneeId,
				reporterId: input.actorUserId,
				dueDate: input.payload.dueDate,
			});

			await this.taskRepository.save(task);
			await this.projectRepository.recordActivity({
				projectId: project.id,
				taskId: task.id,
				actorId: input.actorUserId,
				action: "task.created",
				metadata: {
					code: task.code,
					title: task.title,
				},
			});

			return TaskMapper.toDto(task);
		});
	}
}
