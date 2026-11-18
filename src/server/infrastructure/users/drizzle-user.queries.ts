import { and, asc, eq, ilike, or } from "drizzle-orm";
import type { IUserQueries } from "#/server/application/users/user-queries.interface";
import { DrizzleBaseRepository } from "#/server/infrastructure/drizzle/base.repository";
import type { AppDb, AppTx } from "#/server/infrastructure/drizzle/db";
import { roles, user, userRoles } from "#/server/infrastructure/drizzle/schema";
import type { AdminUserDto } from "#/shared/schemas/user.schema";

export class DrizzleUserQueries
	extends DrizzleBaseRepository<AppDb, AppTx>
	implements IUserQueries
{
	async listAdminUsers(search?: string): Promise<AdminUserDto[]> {
		const trimmedSearch = search?.trim() ?? "";
		const searchPattern = `%${trimmedSearch}%`;
		const searchFilter = trimmedSearch
			? or(ilike(user.name, searchPattern), ilike(user.email, searchPattern))
			: undefined;

		const rows = await this.executor
			.select({
				userId: user.id,
				userName: user.name,
				userEmail: user.email,
				emailVerified: user.emailVerified,
				createdAt: user.createdAt,
				roleId: roles.id,
				roleName: roles.name,
				roleSlug: roles.slug,
			})
			.from(user)
			.leftJoin(userRoles, eq(user.id, userRoles.userId))
			.leftJoin(
				roles,
				and(eq(userRoles.roleId, roles.id), eq(roles.scope, "system")),
			)
			.where(searchFilter)
			.orderBy(asc(user.createdAt), asc(roles.name));

		const userMap = new Map<string, AdminUserDto>();

		for (const row of rows) {
			let entry = userMap.get(row.userId);
			if (!entry) {
				entry = {
					id: row.userId,
					name: row.userName,
					email: row.userEmail,
					emailVerified: row.emailVerified,
					createdAt: row.createdAt.toISOString(),
					systemRoles: [],
				};
				userMap.set(row.userId, entry);
			}

			if (row.roleId && row.roleName && row.roleSlug) {
				entry.systemRoles.push({
					id: row.roleId,
					name: row.roleName,
					slug: row.roleSlug,
				});
			}
		}

		return [...userMap.values()];
	}

	async existsById(userId: string): Promise<boolean> {
		const [found] = await this.executor
			.select({ id: user.id })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		return Boolean(found);
	}
}
