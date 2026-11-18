import type { AuthorizationService } from "#/server/application/common/authorization.service";
import { SYSTEM_PERMISSIONS } from "#/server/domain/rbac/permission-codes";
import type {
	ListProjectsResultDto,
	ProjectsSearch,
} from "#/shared/schemas/project.schema";
import type { IProjectQueries } from "./project-queries.interface";

export interface ListProjectsUseCaseInput {
	actorUserId: string;
	actorSystemPermissions: readonly string[];
	payload: ProjectsSearch;
}

export class ListProjectsUseCase {
	constructor(
		private readonly projectQueries: IProjectQueries,
		private readonly authorizationService: AuthorizationService,
	) {}

	async execute(
		input: ListProjectsUseCaseInput,
	): Promise<ListProjectsResultDto> {
		const includeAllProjects = this.authorizationService.hasSystemPermission(
			input.actorSystemPermissions,
			SYSTEM_PERMISSIONS.PROJECT_READ_ALL,
		);

		return this.projectQueries.listProjects({
			actorUserId: input.actorUserId,
			includeAllProjects,
			params: input.payload,
		});
	}
}
