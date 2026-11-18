import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import {
	RoleSlugAlreadyExistsError,
	UnknowPermissionError,
} from "#/server/domain/rbac/rbac.errors";
import type { IRbacRepository } from "#/server/domain/rbac/rbac.repository";
import { Role } from "#/server/domain/rbac/role.entity";
import type { CreateRoleInput, RoleDto } from "#/shared/schemas/rbac.schema";
import { RbacMapper } from "../mappers/rbac.mapper";

export interface CreateRoleUseCaseInput {
	payload: CreateRoleInput;
}

export class CreateRoleUseCase {
	constructor(
		private readonly rbacRepository: IRbacRepository,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: CreateRoleUseCaseInput): Promise<RoleDto> {
		return this.unitOfWork.withTransaction(async () => {
			const existingRole = await this.rbacRepository.findRoleBySlug(
				input.payload.slug,
			);
			if (existingRole) {
				throw new RoleSlugAlreadyExistsError(input.payload.slug);
			}

			const uniquePermissionIds = [...new Set(input.payload.permissionIds)];
			const permissions =
				await this.rbacRepository.findPermissionsByIds(uniquePermissionIds);

			if (permissions.length !== uniquePermissionIds.length) {
				throw new UnknowPermissionError();
			}

			const role = Role.create({
				name: input.payload.name,
				slug: input.payload.slug,
				scope: input.payload.scope,
				description: input.payload.description,
				permissions,
			});

			await this.rbacRepository.saveRole(role);

			return RbacMapper.toRoleDto(role);
		});
	}
}
