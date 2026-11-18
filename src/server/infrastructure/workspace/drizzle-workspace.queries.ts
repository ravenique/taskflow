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
	or,
	sql,
} from "drizzle-orm";
import type {
	IWorkspaceQueries,
	ListMyAssignedTasksQueryInput,
	WorkspaceOverviewQueryInput,
} from "#/server/application/workspace/workspace-queries.interface";
import { DrizzleBaseRepository } from "#/server/infrastructure/drizzle/base.repository";
import type { AppDb, AppTx } from "#/server/infrastructure/drizzle/db";
import {
	activityLogs,
	projectMembers,
	projects,
	roles,
	taskComments,
	tasks,
	user,
} from "#/server/infrastructure/drizzle/schema";
import { activityLogMetadataSchema } from "#/shared/schemas/project.schema";
import type {
	ListMyAssignedTasksResultDto,
	MyTasksSortField,
	WorkspaceOverviewDto,
} from "#/shared/schemas/workspace.schema";

const OPEN_TASK_STATUSES = ["todo", "in_progress", "in_review"] as const;

const SORT_COLUMN_MAP = {
	projectKey: projects.key,
	code: tasks.code,
	title: tasks.title,
	status: tasks.status,
	priority: tasks.priority,
	dueDate: tasks.dueDate,
	updatedAt: tasks.updatedAt,
} as const satisfies Record<MyTasksSortField, unknown>;

export class DrizzleWorkspaceQueries
	extends DrizzleBaseRepository<AppDb, AppTx>
	implements IWorkspaceQueries
{
	private buildVisibleProjectCondition(actorUserId: string): SQL {
		return exists(
			this.executor
				.select({ matched: sql`1` })
				.from(projectMembers)
				.where(
					and(
						eq(projectMembers.projectId, projects.id),
						eq(projectMembers.userId, actorUserId),
					),
				),
		);
	}

	async getWorkspaceOverview(
		input: WorkspaceOverviewQueryInput,
	): Promise<WorkspaceOverviewDto> {
		const { actorUserId, includeAllProjects } = input;
		const membershipFilter = includeAllProjects
			? undefined
			: this.buildVisibleProjectCondition(actorUserId);

		const activeProjectsFilter = membershipFilter
			? and(eq(projects.status, "active"), membershipFilter)
			: eq(projects.status, "active");

		const myTaskConditions: SQL[] = [eq(tasks.assigneeId, actorUserId)];
		if (membershipFilter) {
			myTaskConditions.push(membershipFilter);
		}

		const [
			projectStatusRows,
			myTaskStatusRows,
			activeProjectRows,
			recentActivityRows,
		] = await Promise.all([
			this.executor
				.select({
					status: projects.status,
					total: count(),
				})
				.from(projects)
				.where(membershipFilter)
				.groupBy(projects.status),
			this.executor
				.select({
					status: tasks.status,
					total: count(),
				})
				.from(tasks)
				.innerJoin(projects, eq(tasks.projectId, projects.id))
				.where(and(...myTaskConditions))
				.groupBy(tasks.status),
			this.executor
				.select({
					id: projects.id,
					key: projects.key,
					name: projects.name,
					status: projects.status,
					updatedAt: projects.updatedAt,
				})
				.from(projects)
				.where(activeProjectsFilter)
				.orderBy(desc(projects.updatedAt), asc(projects.key))
				.limit(5),
			this.executor
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
				.innerJoin(projects, eq(activityLogs.projectId, projects.id))
				.innerJoin(user, eq(activityLogs.actorId, user.id))
				.where(membershipFilter)
				.orderBy(desc(activityLogs.createdAt))
				.limit(10),
		]);

		let activeProjectCount = 0;
		let archivedProjectCount = 0;
		for (const row of projectStatusRows) {
			if (row.status === "active") {
				activeProjectCount = Number(row.total);
			} else if (row.status === "archived") {
				archivedProjectCount = Number(row.total);
			}
		}

		let assignedOpenTaskCount = 0;
		let assignedDoneTaskCount = 0;
		for (const row of myTaskStatusRows) {
			const total = Number(row.total);
			if (
				row.status === "todo" ||
				row.status === "in_progress" ||
				row.status === "in_review"
			) {
				assignedOpenTaskCount += total;
			} else if (row.status === "done") {
				assignedDoneTaskCount += total;
			}
		}

		const activeProjectIds = activeProjectRows.map((row) => row.id);
		const memberCountMap = new Map<string, number>();
		const openTaskCountMap = new Map<string, number>();
		const myRoleMap = new Map<string, string>();

		if (activeProjectIds.length > 0) {
			const [memberCountRows, openTaskCountRows, myRoleRows] =
				await Promise.all([
					this.executor
						.select({
							projectId: projectMembers.projectId,
							total: count(),
						})
						.from(projectMembers)
						.where(inArray(projectMembers.projectId, activeProjectIds))
						.groupBy(projectMembers.projectId),
					this.executor
						.select({
							projectId: tasks.projectId,
							total: count(),
						})
						.from(tasks)
						.where(
							and(
								inArray(tasks.projectId, activeProjectIds),
								inArray(tasks.status, OPEN_TASK_STATUSES),
							),
						)
						.groupBy(tasks.projectId),
					this.executor
						.select({
							projectId: projectMembers.projectId,
							roleName: roles.name,
						})
						.from(projectMembers)
						.innerJoin(roles, eq(projectMembers.roleId, roles.id))
						.where(
							and(
								inArray(projectMembers.projectId, activeProjectIds),
								eq(projectMembers.userId, actorUserId),
							),
						),
				]);

			for (const row of memberCountRows) {
				memberCountMap.set(row.projectId, Number(row.total));
			}
			for (const row of openTaskCountRows) {
				openTaskCountMap.set(row.projectId, Number(row.total));
			}
			for (const row of myRoleRows) {
				myRoleMap.set(row.projectId, row.roleName);
			}
		}

		return {
			summary: {
				activeProjectCount,
				archivedProjectCount,
				assignedOpenTaskCount,
				assignedDoneTaskCount,
			},
			activeProjects: activeProjectRows.map((row) => ({
				id: row.id,
				key: row.key,
				name: row.name,
				status: row.status,
				myRoleName: myRoleMap.get(row.id) ?? null,
				openTaskCount: openTaskCountMap.get(row.id) ?? 0,
				memberCount: memberCountMap.get(row.id) ?? 0,
				updatedAt: row.updatedAt.toISOString(),
			})),
			recentActivities: recentActivityRows.map((row) => {
				const parsedMetadata = activityLogMetadataSchema.safeParse(
					row.metadata,
				);
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
			}),
		};
	}

	async listMyAssignedTasks(
		input: ListMyAssignedTasksQueryInput,
	): Promise<ListMyAssignedTasksResultDto> {
		const { actorUserId, includeAllProjects, params } = input;
		const conditions: SQL[] = [eq(tasks.assigneeId, actorUserId)];

		if (!includeAllProjects) {
			conditions.push(this.buildVisibleProjectCondition(actorUserId));
		}

		if (params.status !== "all") {
			conditions.push(eq(tasks.status, params.status));
		}

		if (params.priority !== "all") {
			conditions.push(eq(tasks.priority, params.priority));
		}

		const trimmedSearch = params.search.trim();
		if (trimmedSearch.length > 0) {
			const pattern = `%${trimmedSearch}%`;
			const searchCondition = or(
				ilike(tasks.code, pattern),
				ilike(tasks.title, pattern),
				ilike(projects.key, pattern),
				ilike(projects.name, pattern),
			);
			if (searchCondition) {
				conditions.push(searchCondition);
			}
		}

		const whereClause = and(...conditions);
		const sortColumn = SORT_COLUMN_MAP[params.sortBy];
		const primaryOrder =
			params.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);
		const offset = (params.page - 1) * params.pageSize;

		const [[totalRow], pageRows] = await Promise.all([
			this.executor
				.select({ total: count() })
				.from(tasks)
				.innerJoin(projects, eq(tasks.projectId, projects.id))
				.where(whereClause),
			this.executor
				.select({
					id: tasks.id,
					projectId: tasks.projectId,
					projectKey: projects.key,
					projectName: projects.name,
					code: tasks.code,
					title: tasks.title,
					status: tasks.status,
					priority: tasks.priority,
					dueDate: tasks.dueDate,
					updatedAt: tasks.updatedAt,
				})
				.from(tasks)
				.innerJoin(projects, eq(tasks.projectId, projects.id))
				.where(whereClause)
				.orderBy(primaryOrder, asc(tasks.id))
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

		const pageTaskIds = pageRows.map((row) => row.id);
		const commentCountRows = await this.executor
			.select({
				taskId: taskComments.taskId,
				total: count(),
			})
			.from(taskComments)
			.where(inArray(taskComments.taskId, pageTaskIds))
			.groupBy(taskComments.taskId);

		const commentCountMap = new Map<string, number>();
		for (const row of commentCountRows) {
			commentCountMap.set(row.taskId, Number(row.total));
		}

		return {
			items: pageRows.map((row) => ({
				id: row.id,
				projectId: row.projectId,
				projectKey: row.projectKey,
				projectName: row.projectName,
				code: row.code,
				title: row.title,
				status: row.status,
				priority: row.priority,
				dueDate: row.dueDate ? row.dueDate.toISOString() : null,
				commentCount: commentCountMap.get(row.id) ?? 0,
				updatedAt: row.updatedAt.toISOString(),
			})),
			total,
			page: params.page,
			pageSize: params.pageSize,
			totalPages,
		};
	}
}
