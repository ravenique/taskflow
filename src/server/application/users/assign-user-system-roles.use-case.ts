import { ValidationDomainError } from "#/server/domain/common/errors";
import type { IUnitOfWork } from "#/server/domain/common/unit-of-work.interface";
import { SYSTEM_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import { RoleNotFoundError } from "#/server/domain/rbac/rbac.errors";
import type { IRbacRepository } from "#/server/domain/rbac/rbac.repository";
import {
	SelfRoleLockoutError,
	UserNotFoundError,
} from "#/server/domain/users/user.errors";
import type { AssignUserSystemRolesInput } from "#/shared/schemas/user.schema";
import type { IUserQueries } from "./user-queries.interface";

export interface AssignUserSystemRolesUseCaseInput {
	actorUserId: string;
	payload: AssignUserSystemRolesInput;
}

export class AssignUserSystemRolesUseCase {
	constructor(
		private readonly rbacRepository: IRbacRepository,
		private readonly userQueries: IUserQueries,
		private readonly unitOfWork: IUnitOfWork,
	) {}

	async execute(input: AssignUserSystemRolesUseCaseInput): Promise<void> {
		await this.unitOfWork.withTransaction(async () => {
			const userExists = await this.userQueries.existsById(
				input.payload.userId,
			);
			if (!userExists) {
				throw new UserNotFoundError(input.payload.userId);
			}

			const uniqueRoleIds = [...new Set(input.payload.roleIds)];
			const roles = await this.rbacRepository.findRolesByIds(uniqueRoleIds);

			if (roles.length !== uniqueRoleIds.length) {
				throw new RoleNotFoundError("roleIds");
			}

			const hasNonSystemRole = roles.some((role) => role.scope !== "system");
			if (hasNonSystemRole) {
				throw new ValidationDomainError(
					"สามารถกำหนดได้เฉพาะบทบาทระดับ 'system' ให้ผู้ใช้งานเท่านั้น",
				);
			}

			if (input.actorUserId === input.payload.userId) {
				const retainsAssignRole = roles.some((role) =>
					role.hasPermission(SYSTEM_PERMISSIONS.USER_ASSIGN_ROLE),
				);
				if (!retainsAssignRole) {
					throw new SelfRoleLockoutError();
				}
			}

			await this.rbacRepository.replaceUserSystemRoles(
				input.payload.userId,
				uniqueRoleIds,
			);
		});
	}
}
