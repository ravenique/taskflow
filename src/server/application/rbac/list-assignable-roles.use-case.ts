import type { IRbacRepository } from "#/server/domain/rbac/rbac.repository";
import type { RoleDto } from "#/shared/schemas/rbac.schema";
import { RbacMapper } from "../mappers/rbac.mapper";

export class ListAssignableRolesUseCase {
	constructor(private readonly rbacRepository: IRbacRepository) {}

	async execute(): Promise<RoleDto[]> {
		const roles = await this.rbacRepository.findAllRoles();
		return roles
			.filter((role) => role.scope === "system")
			.map((role) => RbacMapper.toRoleDto(role));
	}
}
