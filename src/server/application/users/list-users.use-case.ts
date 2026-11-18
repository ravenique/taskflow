import type {
	AdminUserDto,
	ListUsersInput,
} from "#/shared/schemas/user.schema";
import type { IUserQueries } from "./user-queries.interface";

export interface ListUsersUseCaseInput {
	payload: ListUsersInput;
}

export class ListUsersUseCase {
	constructor(private readonly userQueries: IUserQueries) {}

	async execute(input: ListUsersUseCaseInput): Promise<AdminUserDto[]> {
		return this.userQueries.listAdminUsers(input.payload.search);
	}
}
