import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import {
	RoleNotFoundError,
	UnknowPermissionError,
} from "#/server/domain/rbac/rbac.errors";
import type { IRbacRepository } from "#/server/domain/rbac/rbac.repository";
import type {
	RoleDto,
	UpdateRolePermissionsInput,
} from "#/shared/schemas/rbac.schema";
import { RbacMapper } from "../mappers/rbac.mapper";

export interface UpdateRolePermissionsUseCaseInput {
	payload: UpdateRolePermissionsInput;
}

export class UpdateRolePermissionsUseCase {
	constructor(
		private readonly rbacRepository: IRbacRepository,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: UpdateRolePermissionsUseCaseInput): Promise<RoleDto> {
		return this.unitOfWork.withTransaction(async () => {
			const role = await this.rbacRepository.findRoleById(input.payload.roleId);
			if (!role) {
				throw new RoleNotFoundError(input.payload.roleId);
			}

			const uniquePermissionIds = [...new Set(input.payload.permissionIds)];
			const permissions =
				await this.rbacRepository.findPermissionsByIds(uniquePermissionIds);
			if (permissions.length !== uniquePermissionIds.length) {
				throw new UnknowPermissionError();
			}

			role.replacePermissions(permissions);
			await this.rbacRepository.saveRole(role);

			return RbacMapper.toRoleDto(role);
		});
	}
}
