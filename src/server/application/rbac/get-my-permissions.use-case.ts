import type { IRbacRepository } from "#/server/domain/rbac/rbac.repository";
import type { MyPermissionsDto } from "#/shared/schemas/rbac.schema";

export interface GetMyPermissionsUseCaseInput {
	userId: string;
}

export class GetMyPermissionsUseCase {
	constructor(private readonly rbacRepository: IRbacRepository) {}

	async execute(
		input: GetMyPermissionsUseCaseInput,
	): Promise<MyPermissionsDto> {
		const access = await this.rbacRepository.getUserSystemAccess(input.userId);

		return {
			systemRoles: access.roleSlugs,
			systemPermissions: access.systemPermissions,
		};
	}
}
