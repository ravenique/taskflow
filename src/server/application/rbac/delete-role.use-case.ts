import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import { RoleNotFoundError } from "#/server/domain/rbac/rbac.errors";
import type { IRbacRepository } from "#/server/domain/rbac/rbac.repository";
import type { DeleteRoleInput } from "#/shared/schemas/rbac.schema";

export interface DeleteRoleUseCaseInput {
	payload: DeleteRoleInput;
}

export class DeleteRoleUseCase {
	constructor(
		private readonly rbacRepository: IRbacRepository,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: DeleteRoleUseCaseInput): Promise<void> {
		await this.unitOfWork.withTransaction(async () => {
			const role = await this.rbacRepository.findRoleById(input.payload.roleId);
			if (!role) {
				throw new RoleNotFoundError(input.payload.roleId);
			}

			role.ensureDeletable();

			const deleted = await this.rbacRepository.deleteRole(role.id);

			if (!deleted) {
				throw new RoleNotFoundError(role.id);
			}
		});
	}
}
