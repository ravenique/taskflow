import { ArchiveProjectUseCase } from "#/server/application/projects/archive-project.use-case";
import { CreateProjectUseCase } from "#/server/application/projects/create-project.use-case";
import { ListProjectsUseCase } from "#/server/application/projects/list-projects.use-case";
import { RestoreProjectUseCase } from "#/server/application/projects/restore-project.use-case";
import { UpdateProjectUseCase } from "#/server/application/projects/update-project.use-case";
import { AddProjectMemberUseCase } from "../application/projects/add-project-member.use-case";
import { ChangeProjectMemberRoleUseCase } from "../application/projects/change-project-member-role.use-case";
import { DeleteProjectUseCase } from "../application/projects/delete-project.use-case";
import { GetProjectDetailUseCase } from "../application/projects/get-project-detail.use-case";
import { ListProjectActivityUseCase } from "../application/projects/list-project-activity.use-case";
import { ListProjectMembersUseCase } from "../application/projects/list-project-members.use-case";
import { RemoveProjectMemberUseCase } from "../application/projects/remove-project-member.use-case";
import { authorizationService } from "./rbac.container";
import {
	projectQueries,
	projectRepository,
	rbacRepository,
	unitOfWork,
	userQueries,
} from "./repositories";

export const listProjectsUseCase = new ListProjectsUseCase(
	projectQueries,
	authorizationService,
);
export const createProjectUseCase = new CreateProjectUseCase(
	projectRepository,
	rbacRepository,
	unitOfWork,
);
export const updateProjectUseCase = new UpdateProjectUseCase(
	projectRepository,
	authorizationService,
	unitOfWork,
);
export const archiveProjectUseCase = new ArchiveProjectUseCase(
	projectRepository,
	authorizationService,
	unitOfWork,
);
export const restoreProjectUseCase = new RestoreProjectUseCase(
	projectRepository,
	authorizationService,
	unitOfWork,
);
export const getProjectDetailUseCase = new GetProjectDetailUseCase(
	projectQueries,
	authorizationService,
);
export const deleteProjectUseCase = new DeleteProjectUseCase(
	projectRepository,
	authorizationService,
	unitOfWork,
);
export const listProjectMembersUseCase = new ListProjectMembersUseCase(
	projectRepository,
	projectQueries,
	authorizationService,
);
export const addProjectMemberUseCase = new AddProjectMemberUseCase(
	projectRepository,
	rbacRepository,
	userQueries,
	authorizationService,
	unitOfWork,
);
export const changeProjectMemberRoleUseCase =
	new ChangeProjectMemberRoleUseCase(
		projectRepository,
		rbacRepository,
		authorizationService,
		unitOfWork,
	);
export const removeProjectMemberUseCase = new RemoveProjectMemberUseCase(
	projectRepository,
	authorizationService,
	unitOfWork,
);
export const listProjectActivityUseCase = new ListProjectActivityUseCase(
	projectRepository,
	projectQueries,
	authorizationService,
);
