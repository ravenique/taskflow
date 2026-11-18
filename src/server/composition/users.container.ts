import { AssignUserSystemRolesUseCase } from "#/server/application/users/assign-user-system-roles.use-case";
import { ListUsersUseCase } from "#/server/application/users/list-users.use-case";
import { rbacRepository, unitOfWork, userQueries } from "./repositories";

export const listUsersUseCase = new ListUsersUseCase(userQueries);
export const assignUserSystemRolesUseCase = new AssignUserSystemRolesUseCase(
	rbacRepository,
	userQueries,
	unitOfWork,
);
