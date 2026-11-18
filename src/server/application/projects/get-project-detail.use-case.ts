import { ProjectNotFoundError } from "#/server/domain/projects/project.errors";
import type {
	GetProjectDetailInput,
	ProjectDetailDto,
} from "#/shared/schemas/project.schema";
import type { AuthorizationService } from "../common/authorization.service";
import type { IProjectQueries } from "./project-queries.interface";

export interface GetProjectDetailUseCaseInput {
	actorUserId: string;
	actorSystemPermissions: readonly string[];
	payload: GetProjectDetailInput;
}

export class GetProjectDetailUseCase {
	constructor(
		private readonly projectQueries: IProjectQueries,
		private readonly authorizationService: AuthorizationService,
	) {}

	async execute(
		input: GetProjectDetailUseCaseInput,
	): Promise<ProjectDetailDto> {
		const detail = await this.projectQueries.findProjectDetailById(
			input.payload.projectId,
			input.actorUserId,
		);

		if (!detail) {
			throw new ProjectNotFoundError(input.payload.projectId);
		}

		this.authorizationService.assertProjectReadAccess(
			input.actorSystemPermissions,
			detail.myPermissions,
		);

		return detail;
	}
}
