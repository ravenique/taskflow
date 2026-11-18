import type { IRbacRepository } from "#/server/domain/rbac/rbac.repository";
import type { ListRolesResultDto } from "#/shared/schemas/rbac.schema";
import { RbacMapper } from "../mappers/rbac.mapper";

export class ListRolesUseCase {
	constructor(private readonly rbacRepository: IRbacRepository) {}

	async execute(): Promise<ListRolesResultDto> {
		const [roles, permissions] = await Promise.all([
			this.rbacRepository.findAllRoles(),
			this.rbacRepository.findAllPermissions(),
		]);

		return {
			roles: roles.map((role) => RbacMapper.toRoleDto(role)),
			permissions: permissions.map((permission) =>
				RbacMapper.toPermissionDto(permission),
			),
		};
	}
}
