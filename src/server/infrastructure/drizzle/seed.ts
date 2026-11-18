import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { unitOfWork } from "#/server/composition/repositories";
import type { AppDb, AppTx } from "#/server/infrastructure/drizzle/db";
import { db, pool } from "#/server/infrastructure/drizzle/db";
import {
	account,
	permissions,
	rolePermissions,
	roles,
	user,
	userRoles,
} from "#/server/infrastructure/drizzle/schema";
import { txStorage } from "#/server/infrastructure/drizzle/tx-context";
import type { PermissionCode, RoleScope } from "#/shared/schemas/rbac.schema";
import { PERMISSION_CATALOG } from "#/shared/schemas/rbac.schema";

interface SeedRoleDefinition {
	readonly name: string;
	readonly slug: string;
	readonly scope: RoleScope;
	readonly description: string;
	readonly isSystem: boolean;
	readonly permissions: readonly PermissionCode[];
}

const DEFAULT_ROLES: readonly SeedRoleDefinition[] = [
	{
		name: "Super Admin",
		slug: "super_admin",
		scope: "system",
		description:
			"Full administrative access across roles, users, and all projects",
		isSystem: true,
		permissions: [
			"role:read",
			"role:manage",
			"user:read",
			"user:assign_role",
			"project:create",
			"project:read_all",
		],
	},
	{
		name: "Standard Member",
		slug: "standard_member",
		scope: "system",
		description:
			"Default workspace member with ability to create projects and view teammates",
		isSystem: true,
		permissions: ["project:create", "user:read"],
	},
	{
		name: "Project Owner",
		slug: "project_owner",
		scope: "project",
		description: "Full control over a project, its members, and tasks",
		isSystem: true,
		permissions: [
			"project:read",
			"project:update",
			"project:delete",
			"project:manage_members",
			"task:create",
			"task:update",
			"task:assign",
			"task:delete",
			"comment:create",
			"comment:delete_any",
		],
	},
	{
		name: "Project Manager",
		slug: "project_manager",
		scope: "project",
		description:
			"Manage project settings, members, and all tasks without deleting the project",
		isSystem: false,
		permissions: [
			"project:read",
			"project:update",
			"project:manage_members",
			"task:create",
			"task:update",
			"task:assign",
			"task:delete",
			"comment:create",
			"comment:delete_any",
		],
	},
	{
		name: "Contributor",
		slug: "contributor",
		scope: "project",
		description: "Create and update tasks and collaborate via comments",
		isSystem: false,
		permissions: [
			"project:read",
			"task:create",
			"task:update",
			"comment:create",
		],
	},
	{
		name: "Viewer",
		slug: "viewer",
		scope: "project",
		description:
			"Read-only access to project details, tasks, and activity logs",
		isSystem: false,
		permissions: ["project:read"],
	},
];

const SEED_ADMIN_EMAIL = "admin@taskflow.local";
const SEED_ADMIN_NAME = "TaskFlow Admin";
const SEED_ADMIN_PASSWORD = "Password123!";

function getExecutor(): AppDb | AppTx {
	const tx = txStorage.getStore() as AppTx | undefined;
	return tx ?? db;
}

async function seedPermissions(): Promise<Map<string, string>> {
	const executor = getExecutor();

	for (const item of PERMISSION_CATALOG) {
		await executor
			.insert(permissions)
			.values({
				code: item.code,
				scope: item.scope,
				description: item.description,
			})
			.onConflictDoUpdate({
				target: permissions.code,
				set: {
					scope: item.scope,
					description: item.description,
				},
			});
	}

	const rows = await executor.select().from(permissions);
	return new Map(rows.map((row) => [row.code, row.id]));
}

async function seedRoles(
	permissionIdByCode: Map<string, string>,
): Promise<Map<string, string>> {
	const executor = getExecutor();
	const roleIdBySlug = new Map<string, string>();

	for (const roleDef of DEFAULT_ROLES) {
		const [upsertedRole] = await executor
			.insert(roles)
			.values({
				name: roleDef.name,
				slug: roleDef.slug,
				scope: roleDef.scope,
				description: roleDef.description,
				isSystem: roleDef.isSystem,
			})
			.onConflictDoUpdate({
				target: roles.slug,
				set: {
					name: roleDef.name,
					scope: roleDef.scope,
					description: roleDef.description,
					isSystem: roleDef.isSystem,
				},
			})
			.returning({ id: roles.id, slug: roles.slug });

		roleIdBySlug.set(upsertedRole.slug, upsertedRole.id);

		const mappings = roleDef.permissions.map((code) => {
			const permissionId = permissionIdByCode.get(code);
			if (!permissionId) {
				throw new Error(`Missing seeded permission for code: ${code}`);
			}
			return {
				roleId: upsertedRole.id,
				permissionId,
			};
		});

		if (mappings.length > 0) {
			await executor
				.insert(rolePermissions)
				.values(mappings)
				.onConflictDoNothing();
		}
	}

	return roleIdBySlug;
}

async function seedAdminUser(superAdminRoleId: string): Promise<void> {
	const executor = getExecutor();
	const [existingUser] = await executor
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, SEED_ADMIN_EMAIL))
		.limit(1);

	let adminUserId = existingUser?.id;

	if (!adminUserId) {
		adminUserId = randomUUID();
		const hashedPassword = await hashPassword(SEED_ADMIN_PASSWORD);

		await executor.insert(user).values({
			id: adminUserId,
			name: SEED_ADMIN_NAME,
			email: SEED_ADMIN_EMAIL,
			emailVerified: true,
		});

		await executor.insert(account).values({
			id: randomUUID(),
			userId: adminUserId,
			accountId: adminUserId,
			providerId: "credential",
			password: hashedPassword,
		});
	}

	await executor
		.insert(userRoles)
		.values({
			userId: adminUserId,
			roleId: superAdminRoleId,
		})
		.onConflictDoNothing();
}

async function main(): Promise<void> {
	await unitOfWork.withTransaction(async () => {
		const permissionIdByCode = await seedPermissions();
		const roleIdBySlug = await seedRoles(permissionIdByCode);

		const superAdminRoleId = roleIdBySlug.get("super_admin");
		if (!superAdminRoleId) {
			throw new Error("Failed to resolve super_admin role ID after seeding");
		}

		await seedAdminUser(superAdminRoleId);
	});

	console.log("Seed completed successfully.");
	console.log(
		`Admin credentials: ${SEED_ADMIN_EMAIL} / ${SEED_ADMIN_PASSWORD}`,
	);
}

try {
	await main();
} finally {
	await pool.end();
}
