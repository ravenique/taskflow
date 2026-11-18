import type { AuthorizationService } from "#/server/application/common/authorization.service";
import { SYSTEM_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import type { WorkspaceOverviewDto } from "#/shared/schemas/workspace.schema";
import type { IWorkspaceQueries } from "./workspace-queries.interface";

export interface GetWorkspaceOverviewUseCaseInput {
	actorUserId: string;
	actorSystemPermissions: readonly string[];
}

export class GetWorkspaceOverviewUseCase {
	constructor(
		private readonly workspaceQueries: IWorkspaceQueries,
		private readonly authorizationService: AuthorizationService,
	) {}

	async execute(
		input: GetWorkspaceOverviewUseCaseInput,
	): Promise<WorkspaceOverviewDto> {
		const includeAllProjects = this.authorizationService.hasSystemPermission(
			input.actorSystemPermissions,
			SYSTEM_PERMISSIONS.PROJECT_READ_ALL,
		);

		return this.workspaceQueries.getWorkspaceOverview({
			actorUserId: input.actorUserId,
			includeAllProjects,
		});
	}
}
