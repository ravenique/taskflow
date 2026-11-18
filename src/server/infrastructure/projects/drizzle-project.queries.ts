import type { SQL } from "drizzle-orm";
import {
	and,
	asc,
	count,
	desc,
	eq,
	exists,
	ilike,
	inArray,
	notExists,
	or,
	sql,
} from "drizzle-orm";
import type {
	IProjectQueries,
	ListProjectsQueryInput,
} from "#/server/application/projects/project-queries.interface";
import { DrizzleBaseRepository } from "#/server/infrastructure/drizzle/base.repository";
import type { AppDb, AppTx } from "#/server/infrastructure/drizzle/db";
import {
	activityLogs,
	permissions,
	projectMembers,
	projects,
	rolePermissions,
	roles,
	tasks,
	user,
} from "#/server/infrastructure/drizzle/schema";
import type {
	ActivityLogDto,
	ListProjectMembersResultDto,
	ListProjectsResultDto,
	ProjectDetailDto,
	ProjectListItemDto,
	ProjectRoleOptionDto,
	ProjectRoleSummary,
	ProjectSortField,
} from "#/shared/schemas/project.schema";
import { activityLogMetadataSchema } from "#/shared/schemas/project.schema";
import type { ProjectPermissionCode } from "#/shared/schemas/rbac.schema";
import { projectPermissionCodeSchema } from "#/shared/schemas/rbac.schema";

const SORT_COLUMN_MAP = {
	key: projects.key,
	name: projects.name,
	status: projects.status,
	createdAt: projects.createdAt,
	updatedAt: projects.updatedAt,
} as const satisfies Record<ProjectSortField, unknown>;

export class DrizzleProjectQueries
	extends DrizzleBaseRepository<AppDb, AppTx>
	implements IProjectQueries
{
	async listProjects(
		input: ListProjectsQueryInput,
	): Promise<ListProjectsResultDto> {
		const { actorUserId, includeAllProjects, params } = input;
		const conditions: SQL[] = [];

		if (!includeAllProjects) {
			conditions.push(
				exists(
					this.executor
						.select({ matched: sql`1` })
						.from(projectMembers)
						.where(
							and(
								eq(projectMembers.projectId, projects.id),
								eq(projectMembers.userId, actorUserId),
							),
						),
				),
			);
		}

		if (params.status !== "all") {
			conditions.push(eq(projects.status, params.status));
		}

		const trimmedSearch = params.search.trim();
		if (trimmedSearch.length > 0) {
			const pattern = `%${trimmedSearch}%`;
			const searchCondition = or(
				ilike(projects.key, pattern),
				ilike(projects.name, pattern),
				ilike(projects.description, pattern),
			);
			if (searchCondition) {
				conditions.push(searchCondition);
			}
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
		const sortColumn = SORT_COLUMN_MAP[params.sortBy];
		const primaryOrder =
			params.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);
		const offset = (params.page - 1) * params.pageSize;

		const [[totalRow], pageRows] = await Promise.all([
			this.executor
				.select({ total: count() })
				.from(projects)
				.where(whereClause),
			this.executor
				.select({
					id: projects.id,
					key: projects.key,
					name: projects.name,
					description: projects.description,
					status: projects.status,
					taskSequence: projects.taskSequence,
					createdById: projects.createdById,
					createdByName: user.name,
					createdAt: projects.createdAt,
					updatedAt: projects.updatedAt,
				})
				.from(projects)
				.innerJoin(user, eq(projects.createdById, user.id))
				.where(whereClause)
				.orderBy(primaryOrder, asc(projects.id))
				.limit(params.pageSize)
				.offset(offset),
		]);

		const total = Number(totalRow?.total ?? 0);
		const totalPages = Math.max(1, Math.ceil(total / params.pageSize));

		if (pageRows.length === 0) {
			return {
				items: [],
				total,
				page: params.page,
				pageSize: params.pageSize,
				totalPages,
			};
		}

		const pageProjectIds = pageRows.map((row) => row.id);
		const [memberCounts, taskCounts, myAccessRows] = await Promise.all([
			this.executor
				.select({
					projectId: projectMembers.projectId,
					total: count(),
				})
				.from(projectMembers)
				.where(inArray(projectMembers.projectId, pageProjectIds))
				.groupBy(projectMembers.projectId),
			this.executor
				.select({
					projectId: tasks.projectId,
					total: count(),
				})
				.from(tasks)
				.where(inArray(tasks.projectId, pageProjectIds))
				.groupBy(tasks.projectId),
			this.executor
				.select({
					projectId: projectMembers.projectId,
					roleName: roles.name,
					permissionCode: permissions.code,
				})
				.from(projectMembers)
				.innerJoin(roles, eq(projectMembers.roleId, roles.id))
				.leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
				.leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
				.where(
					and(
						inArray(projectMembers.projectId, pageProjectIds),
						eq(projectMembers.userId, actorUserId),
						eq(roles.scope, "project"),
					),
				),
		]);

		const memberCountMap = new Map(
			memberCounts.map((row) => [row.projectId, Number(row.total)]),
		);
		const taskCountMap = new Map(
			taskCounts.map((row) => [row.projectId, Number(row.total)]),
		);

		const roleNameByProjectId = new Map<string, string>();
		const canUpdateByProjectId = new Map<string, boolean>();
		for (const row of myAccessRows) {
			roleNameByProjectId.set(row.projectId, row.roleName);
			if (row.permissionCode === "project:update") {
				canUpdateByProjectId.set(row.projectId, true);
			}
		}

		const items: ProjectListItemDto[] = pageRows.map((row) => ({
			id: row.id,
			key: row.key,
			name: row.name,
			description: row.description,
			status: row.status,
			taskSequence: row.taskSequence,
			createdById: row.createdById,
			createdByName: row.createdByName,
			memberCount: memberCountMap.get(row.id) ?? 0,
			taskCount: taskCountMap.get(row.id) ?? 0,
			myRoleName: roleNameByProjectId.get(row.id) ?? null,
			canUpdate: canUpdateByProjectId.get(row.id) ?? false,
			createdAt: row.createdAt.toISOString(),
			updatedAt: row.updatedAt.toISOString(),
		}));

		return {
			items,
			total,
			page: params.page,
			pageSize: params.pageSize,
			totalPages,
		};
	}

	async findProjectDetailById(
		projectId: string,
		actorUserId: string,
	): Promise<ProjectDetailDto | null> {
		const [projectRow] = await this.executor
			.select({
				id: projects.id,
				key: projects.key,
				name: projects.name,
				description: projects.description,
				status: projects.status,
				taskSequence: projects.taskSequence,
				createdById: projects.createdById,
				createdByName: user.name,
				createdAt: projects.createdAt,
				updatedAt: projects.updatedAt,
			})
			.from(projects)
			.innerJoin(user, eq(projects.createdById, user.id))
			.where(eq(projects.id, projectId))
			.limit(1);

		if (!projectRow) {
			return null;
		}

		const [[memberCountRow], [taskCountRow], myAccessRows] = await Promise.all([
			this.executor
				.select({ total: count() })
				.from(projectMembers)
				.where(eq(projectMembers.projectId, projectId)),
			this.executor
				.select({ total: count() })
				.from(tasks)
				.where(eq(tasks.projectId, projectId)),
			this.executor
				.select({
					roleId: roles.id,
					roleName: roles.name,
					roleSlug: roles.slug,
					permissionCode: permissions.code,
				})
				.from(projectMembers)
				.innerJoin(roles, eq(projectMembers.roleId, roles.id))
				.leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
				.leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
				.where(
					and(
						eq(projectMembers.projectId, projectId),
						eq(projectMembers.userId, actorUserId),
						eq(roles.scope, "project"),
					),
				),
		]);

		let myRole: ProjectRoleSummary | null = null;
		const myPermissionSet = new Set<ProjectPermissionCode>();

		for (const row of myAccessRows) {
			myRole = {
				id: row.roleId,
				name: row.roleName,
				slug: row.roleSlug,
			};
			if (row.permissionCode) {
				const parsed = projectPermissionCodeSchema.safeParse(
					row.permissionCode,
				);
				if (parsed.success) {
					myPermissionSet.add(parsed.data);
				}
			}
		}

		return {
			id: projectRow.id,
			key: projectRow.key,
			name: projectRow.name,
			description: projectRow.description,
			status: projectRow.status,
			taskSequence: projectRow.taskSequence,
			createdById: projectRow.createdById,
			createdByName: projectRow.createdByName,
			memberCount: Number(memberCountRow?.total ?? 0),
			taskCount: Number(taskCountRow?.total ?? 0),
			myRole,
			myPermissions: [...myPermissionSet].sort(),
			createdAt: projectRow.createdAt.toISOString(),
			updatedAt: projectRow.updatedAt.toISOString(),
		};
	}

	async listProjectMembers(
		projectId: string,
	): Promise<ListProjectMembersResultDto> {
		const [memberRows, rolePermissionRows, invitableUserRows] =
			await Promise.all([
				this.executor
					.select({
						id: projectMembers.id,
						projectId: projectMembers.projectId,
						userId: user.id,
						userName: user.name,
						userEmail: user.email,
						roleId: roles.id,
						roleName: roles.name,
						roleSlug: roles.slug,
						joinedAt: projectMembers.joinedAt,
					})
					.from(projectMembers)
					.innerJoin(user, eq(projectMembers.userId, user.id))
					.innerJoin(roles, eq(projectMembers.roleId, roles.id))
					.where(eq(projectMembers.projectId, projectId))
					.orderBy(asc(roles.name), asc(user.name)),
				this.executor
					.select({
						roleId: roles.id,
						roleName: roles.name,
						roleSlug: roles.slug,
						roleDescription: roles.description,
						isSystem: roles.isSystem,
						permissionCode: permissions.code,
					})
					.from(roles)
					.leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
					.leftJoin(
						permissions,
						eq(rolePermissions.permissionId, permissions.id),
					)
					.where(eq(roles.scope, "project"))
					.orderBy(asc(roles.name), asc(permissions.code)),
				this.executor
					.select({
						id: user.id,
						name: user.name,
						email: user.email,
					})
					.from(user)
					.where(
						notExists(
							this.executor
								.select({ matched: sql`1` })
								.from(projectMembers)
								.where(
									and(
										eq(projectMembers.projectId, projectId),
										eq(projectMembers.userId, user.id),
									),
								),
						),
					)
					.orderBy(asc(user.name)),
			]);

		const roleOptionMap = new Map<string, ProjectRoleOptionDto>();
		for (const row of rolePermissionRows) {
			let entry = roleOptionMap.get(row.roleId);
			if (!entry) {
				entry = {
					id: row.roleId,
					name: row.roleName,
					slug: row.roleSlug,
					description: row.roleDescription,
					isSystem: row.isSystem,
					permissions: [],
				};
				roleOptionMap.set(row.roleId, entry);
			}
			if (row.permissionCode) {
				const parsed = projectPermissionCodeSchema.safeParse(
					row.permissionCode,
				);
				if (parsed.success) {
					entry.permissions.push(parsed.data);
				}
			}
		}

		return {
			members: memberRows.map((row) => ({
				id: row.id,
				projectId: row.projectId,
				userId: row.userId,
				userName: row.userName,
				userEmail: row.userEmail,
				roleId: row.roleId,
				roleName: row.roleName,
				roleSlug: row.roleSlug,
				isOwnerRole: row.roleSlug === "project_owner",
				joinedAt: row.joinedAt.toISOString(),
			})),
			availableRoles: [...roleOptionMap.values()],
			invitableUsers: invitableUserRows,
		};
	}

	async listProjectActivity(
		projectId: string,
		limit: number,
	): Promise<ActivityLogDto[]> {
		const rows = await this.executor
			.select({
				id: activityLogs.id,
				projectId: activityLogs.projectId,
				taskId: activityLogs.taskId,
				actorId: activityLogs.actorId,
				actorName: user.name,
				actorEmail: user.email,
				action: activityLogs.action,
				metadata: activityLogs.metadata,
				createdAt: activityLogs.createdAt,
			})
			.from(activityLogs)
			.innerJoin(user, eq(activityLogs.actorId, user.id))
			.where(eq(activityLogs.projectId, projectId))
			.orderBy(desc(activityLogs.createdAt))
			.limit(limit);

		return rows.map((row) => {
			const parsedMetadata = activityLogMetadataSchema.safeParse(row.metadata);
			return {
				id: row.id,
				projectId: row.projectId,
				taskId: row.taskId,
				actorId: row.actorId,
				actorName: row.actorName,
				actorEmail: row.actorEmail,
				action: row.action,
				metadata: parsedMetadata.success ? parsedMetadata.data : {},
				createdAt: row.createdAt.toISOString(),
			};
		});
	}
}
