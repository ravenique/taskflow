import { AddTaskCommentUseCase } from "#/server/application/tasks/add-task-comment.use-case";
import { AssignTaskUseCase } from "#/server/application/tasks/assign-task.use-case";
import { CreateTaskUseCase } from "#/server/application/tasks/create-task.use-case";
import { DeleteTaskUseCase } from "#/server/application/tasks/delete-task.use-case";
import { DeleteTaskCommentUseCase } from "#/server/application/tasks/delete-task-comment.use-case";
import { GetTaskDetailUseCase } from "#/server/application/tasks/get-task-detail.use-case";
import { ListTasksUseCase } from "#/server/application/tasks/list-tasks.use-case";
import { TransitionTaskStatusUseCase } from "#/server/application/tasks/transition-task-status.use-case";
import { UpdateTaskUseCase } from "#/server/application/tasks/update-task.use-case";
import { authorizationService } from "./rbac.container";
import {
	projectRepository,
	taskQueries,
	taskRepository,
	unitOfWork,
} from "./repositories";

export const listTasksUseCase = new ListTasksUseCase(
	projectRepository,
	taskQueries,
	authorizationService,
);

export const getTaskDetailUseCase = new GetTaskDetailUseCase(
	projectRepository,
	taskQueries,
	authorizationService,
);

export const createTaskUseCase = new CreateTaskUseCase(
	projectRepository,
	taskRepository,
	authorizationService,
	unitOfWork,
);

export const updateTaskUseCase = new UpdateTaskUseCase(
	projectRepository,
	taskRepository,
	authorizationService,
	unitOfWork,
);

export const transitionTaskStatusUseCase = new TransitionTaskStatusUseCase(
	projectRepository,
	taskRepository,
	authorizationService,
	unitOfWork,
);

export const assignTaskUseCase = new AssignTaskUseCase(
	projectRepository,
	taskRepository,
	authorizationService,
	unitOfWork,
);

export const deleteTaskUseCase = new DeleteTaskUseCase(
	projectRepository,
	taskRepository,
	authorizationService,
	unitOfWork,
);

export const addTaskCommentUseCase = new AddTaskCommentUseCase(
	projectRepository,
	taskRepository,
	authorizationService,
	unitOfWork,
);

export const deleteTaskCommentUseCase = new DeleteTaskCommentUseCase(
	projectRepository,
	taskRepository,
	authorizationService,
	unitOfWork,
);
