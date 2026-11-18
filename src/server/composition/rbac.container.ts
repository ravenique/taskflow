import { AuthorizationService } from "#/server/application/common/authorization.service";
import { CreateRoleUseCase } from "#/server/application/rbac/create-role.use-case";
import { DeleteRoleUseCase } from "#/server/application/rbac/delete-role.use-case";
import { GetMyPermissionsUseCase } from "#/server/application/rbac/get-my-permissions.use-case";
import { ListAssignableRolesUseCase } from "#/server/application/rbac/list-assignable-roles.use-case";
import { ListRolesUseCase } from "#/server/application/rbac/list-roles.use-case";
import { UpdateRolePermissionsUseCase } from "#/server/application/rbac/update-role-permissions.use-case";
import { rbacRepository, unitOfWork } from "./repositories";

export const authorizationService = new AuthorizationService();
export const listRolesUseCase = new ListRolesUseCase(rbacRepository);
export const listAssignableRolesUseCase = new ListAssignableRolesUseCase(
	rbacRepository,
);
export const createRoleUseCase = new CreateRoleUseCase(
	rbacRepository,
	unitOfWork,
);
export const updateRolePermissionsUseCase = new UpdateRolePermissionsUseCase(
	rbacRepository,
	unitOfWork,
);
export const deleteRoleUseCase = new DeleteRoleUseCase(
	rbacRepository,
	unitOfWork,
);
export const getMyPermissionsUseCase = new GetMyPermissionsUseCase(
	rbacRepository,
);
