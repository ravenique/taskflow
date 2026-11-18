import type { AuthorizationService } from "#/server/application/common/authorization.service";
import { SYSTEM_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import type {
	ListMyAssignedTasksResultDto,
	MyTasksSearch,
} from "#/shared/schemas/workspace.schema";
import type { IWorkspaceQueries } from "./workspace-queries.interface";

export interface ListMyAssignedTasksUseCaseInput {
	actorUserId: string;
	actorSystemPermissions: readonly string[];
	params: MyTasksSearch;
}

export class ListMyAssignedTasksUseCase {
	constructor(
		private readonly workspaceQueries: IWorkspaceQueries,
		private readonly authorizationService: AuthorizationService,
	) {}

	async execute(
		input: ListMyAssignedTasksUseCaseInput,
	): Promise<ListMyAssignedTasksResultDto> {
		const includeAllProjects = this.authorizationService.hasSystemPermission(
			input.actorSystemPermissions,
			SYSTEM_PERMISSIONS.PROJECT_READ_ALL,
		);

		return this.workspaceQueries.listMyAssignedTasks({
			actorUserId: input.actorUserId,
			includeAllProjects,
			params: input.params,
		});
	}
}
