import { and, asc, eq, inArray } from "drizzle-orm";
import { Permission } from "#/server/domain/rbac/permission.entity";
import { RoleInUseError } from "#/server/domain/rbac/rbac.errors";
import type {
	IRbacRepository,
	UserSystemAccess,
} from "#/server/domain/rbac/rbac.repository";
import { Role } from "#/server/domain/rbac/role.entity";
import { DrizzleBaseRepository } from "#/server/infrastructure/drizzle/base.repository";
import type { AppDb, AppTx } from "#/server/infrastructure/drizzle/db";
import {
	permissions,
	rolePermissions,
	roles,
	userRoles,
} from "#/server/infrastructure/drizzle/schema";
import type { SystemPermissionCode } from "#/shared/schemas/rbac.schema";
import {
	permissionCodeSchema,
	systemPermissionCodeSchema,
} from "#/shared/schemas/rbac.schema";

type PermissionRow = typeof permissions.$inferSelect;
type RoleRow = typeof roles.$inferSelect;

function hasPgErrorCode(error: unknown, targetCode: string): boolean {
	if (typeof error !== "object" || error === null) {
		return false;
	}
	if ("code" in error && error.code === targetCode) {
		return true;
	}
	if ("cause" in error) {
		return hasPgErrorCode(error.cause, targetCode);
	}
	return false;
}

export class DrizzleRbacRepository
	extends DrizzleBaseRepository<AppDb, AppTx>
	implements IRbacRepository
{
	async findAllRoles(): Promise<Role[]> {
		const roleRows = await this.executor
			.select()
			.from(roles)
			.orderBy(asc(roles.scope), asc(roles.name));

		return this.hydrateRoles(roleRows);
	}

	async findRoleById(roleId: string): Promise<Role | null> {
		const [roleRow] = await this.executor
			.select()
			.from(roles)
			.where(eq(roles.id, roleId))
			.limit(1);

		if (!roleRow) {
			return null;
		}

		const [hydrated] = await this.hydrateRoles([roleRow]);
		return hydrated ?? null;
	}

	async findRoleBySlug(slug: string): Promise<Role | null> {
		const [roleRow] = await this.executor
			.select()
			.from(roles)
			.where(eq(roles.slug, slug))
			.limit(1);

		if (!roleRow) {
			return null;
		}

		const [hydrated] = await this.hydrateRoles([roleRow]);
		return hydrated ?? null;
	}

	async findRolesByIds(roleIds: readonly string[]): Promise<Role[]> {
		if (roleIds.length === 0) {
			return [];
		}

		const roleRows = await this.executor
			.select()
			.from(roles)
			.where(inArray(roles.id, [...roleIds]))
			.orderBy(asc(roles.name));

		return this.hydrateRoles(roleRows);
	}

	async findAllPermissions(): Promise<Permission[]> {
		const rows = await this.executor
			.select()
			.from(permissions)
			.orderBy(asc(permissions.scope), asc(permissions.code));

		return rows.map((row) => this.toPermissionEntity(row));
	}

	async findPermissionsByIds(
		permissionIds: readonly string[],
	): Promise<Permission[]> {
		if (permissionIds.length === 0) {
			return [];
		}

		const rows = await this.executor
			.select()
			.from(permissions)
			.where(inArray(permissions.id, [...permissionIds]));

		return rows.map((row) => this.toPermissionEntity(row));
	}

	async saveRole(role: Role): Promise<void> {
		await this.executor
			.insert(roles)
			.values({
				id: role.id,
				name: role.name,
				slug: role.slug,
				scope: role.scope,
				description: role.description,
				isSystem: role.isSystem,
				createdAt: role.createdAt,
				updatedAt: role.updatedAt,
			})
			.onConflictDoUpdate({
				target: roles.id,
				set: {
					name: role.name,
					description: role.description,
					updatedAt: role.updatedAt,
				},
			});

		await this.executor
			.delete(rolePermissions)
			.where(eq(rolePermissions.roleId, role.id));

		if (role.permissions.length > 0) {
			await this.executor.insert(rolePermissions).values(
				role.permissions.map((permission) => ({
					roleId: role.id,
					permissionId: permission.id,
				})),
			);
		}
	}

	async deleteRole(roleId: string): Promise<boolean> {
		try {
			const deleted = await this.executor
				.delete(roles)
				.where(eq(roles.id, roleId))
				.returning({ id: roles.id });

			return deleted.length > 0;
		} catch (error) {
			if (hasPgErrorCode(error, "23503")) {
				throw new RoleInUseError();
			}
			throw error;
		}
	}

	async getUserSystemAccess(userId: string): Promise<UserSystemAccess> {
		const rows = await this.executor
			.select({
				roleSlug: roles.slug,
				permissionCode: permissions.code,
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
			.leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
			.where(and(eq(userRoles.userId, userId), eq(roles.scope, "system")));

		const roleSlugSet = new Set<string>();
		const permissionSet = new Set<SystemPermissionCode>();

		for (const row of rows) {
			roleSlugSet.add(row.roleSlug);
			if (row.permissionCode) {
				const parsed = systemPermissionCodeSchema.safeParse(row.permissionCode);
				if (parsed.success) {
					permissionSet.add(parsed.data);
				}
			}
		}

		return {
			roleSlugs: [...roleSlugSet].sort(),
			systemPermissions: [...permissionSet].sort(),
		};
	}

	async replaceUserSystemRoles(
		userId: string,
		roleIds: readonly string[],
	): Promise<void> {
		await this.executor.delete(userRoles).where(eq(userRoles.userId, userId));

		if (roleIds.length > 0) {
			await this.executor.insert(userRoles).values(
				roleIds.map((roleId) => ({
					userId,
					roleId,
				})),
			);
		}
	}

	private async hydrateRoles(roleRows: readonly RoleRow[]): Promise<Role[]> {
		if (roleRows.length === 0) {
			return [];
		}

		const roleIds = roleRows.map((row) => row.id);
		const mappingRows = await this.executor
			.select({
				roleId: rolePermissions.roleId,
				permission: permissions,
			})
			.from(rolePermissions)
			.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
			.where(inArray(rolePermissions.roleId, roleIds))
			.orderBy(asc(permissions.code));

		const permissionsByRoleId = new Map<string, Permission[]>();
		for (const row of mappingRows) {
			const entity = this.toPermissionEntity(row.permission);
			const current = permissionsByRoleId.get(row.roleId) ?? [];
			current.push(entity);
			permissionsByRoleId.set(row.roleId, current);
		}

		return roleRows.map((row) =>
			Role.reconstitute(row.id, {
				name: row.name,
				slug: row.slug,
				scope: row.scope,
				description: row.description,
				isSystem: row.isSystem,
				permissions: permissionsByRoleId.get(row.id) ?? [],
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			}),
		);
	}

	private toPermissionEntity(row: PermissionRow): Permission {
		return Permission.reconstitute(row.id, {
			code: permissionCodeSchema.parse(row.code),
			scope: row.scope,
			description: row.description,
			createdAt: row.createdAt,
		});
	}
}
