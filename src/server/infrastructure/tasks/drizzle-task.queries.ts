import type { SQL } from "drizzle-orm";
import {
	and,
	asc,
	count,
	desc,
	eq,
	ilike,
	inArray,
	isNull,
	or,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { ITaskQueries } from "#/server/application/tasks/task-queries.interface";
import { getAllowedTaskTransitions } from "#/server/domain/tasks/task-status.vo";
import { DrizzleBaseRepository } from "#/server/infrastructure/drizzle/base.repository";
import type { AppDb, AppTx } from "#/server/infrastructure/drizzle/db";
import {
	activityLogs,
	taskComments,
	tasks,
	user,
} from "#/server/infrastructure/drizzle/schema";
import { activityLogMetadataSchema } from "#/shared/schemas/project.schema";
import type {
	ListTasksResultDto,
	TaskDetailDto,
	TaskSortField,
	TasksSearch,
} from "#/shared/schemas/task.schema";

const SORT_COLUMN_MAP = {
	code: tasks.code,
	title: tasks.title,
	status: tasks.status,
	priority: tasks.priority,
	dueDate: tasks.dueDate,
	createdAt: tasks.createdAt,
	updatedAt: tasks.updatedAt,
} as const satisfies Record<TaskSortField, unknown>;

export class DrizzleTaskQueries
	extends DrizzleBaseRepository<AppDb, AppTx>
	implements ITaskQueries
{
	async listTasks(
		projectId: string,
		params: TasksSearch,
	): Promise<ListTasksResultDto> {
		const conditions: SQL[] = [eq(tasks.projectId, projectId)];

		if (params.status !== "all") {
			conditions.push(eq(tasks.status, params.status));
		}

		if (params.priority !== "all") {
			conditions.push(eq(tasks.priority, params.priority));
		}

		if (params.assigneeFilter === "unassigned") {
			conditions.push(isNull(tasks.assigneeId));
		} else if (params.assigneeFilter !== "all") {
			conditions.push(eq(tasks.assigneeId, params.assigneeFilter));
		}

		const trimmedSearch = params.search.trim();
		if (trimmedSearch.length > 0) {
			const pattern = `%${trimmedSearch}%`;
			const searchCondition = or(
				ilike(tasks.code, pattern),
				ilike(tasks.title, pattern),
				ilike(tasks.description, pattern),
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

		const assigneeUser = alias(user, "task_assignee");
		const reporterUser = alias(user, "task_reporter");

		const [[totalRow], pageRows] = await Promise.all([
			this.executor.select({ total: count() }).from(tasks).where(whereClause),
			this.executor
				.select({
					id: tasks.id,
					projectId: tasks.projectId,
					code: tasks.code,
					title: tasks.title,
					description: tasks.description,
					status: tasks.status,
					priority: tasks.priority,
					dueDate: tasks.dueDate,
					createdAt: tasks.createdAt,
					updatedAt: tasks.updatedAt,
					assigneeId: assigneeUser.id,
					assigneeName: assigneeUser.name,
					assigneeEmail: assigneeUser.email,
					reporterId: reporterUser.id,
					reporterName: reporterUser.name,
					reporterEmail: reporterUser.email,
				})
				.from(tasks)
				.leftJoin(assigneeUser, eq(tasks.assigneeId, assigneeUser.id))
				.innerJoin(reporterUser, eq(tasks.reporterId, reporterUser.id))
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
				code: row.code,
				title: row.title,
				description: row.description,
				status: row.status,
				priority: row.priority,
				assignee:
					row.assigneeId && row.assigneeName && row.assigneeEmail
						? {
								id: row.assigneeId,
								name: row.assigneeName,
								email: row.assigneeEmail,
							}
						: null,
				reporter: {
					id: row.reporterId,
					name: row.reporterName,
					email: row.reporterEmail,
				},
				dueDate: row.dueDate ? row.dueDate.toISOString() : null,
				commentCount: commentCountMap.get(row.id) ?? 0,
				createdAt: row.createdAt.toISOString(),
				updatedAt: row.updatedAt.toISOString(),
			})),
			total,
			page: params.page,
			pageSize: params.pageSize,
			totalPages,
		};
	}

	async findTaskDetailById(
		projectId: string,
		taskId: string,
	): Promise<TaskDetailDto | null> {
		const assigneeUser = alias(user, "task_detail_assignee");
		const reporterUser = alias(user, "task_detail_reporter");

		const [row] = await this.executor
			.select({
				id: tasks.id,
				projectId: tasks.projectId,
				code: tasks.code,
				title: tasks.title,
				description: tasks.description,
				status: tasks.status,
				priority: tasks.priority,
				dueDate: tasks.dueDate,
				createdAt: tasks.createdAt,
				updatedAt: tasks.updatedAt,
				assigneeId: assigneeUser.id,
				assigneeName: assigneeUser.name,
				assigneeEmail: assigneeUser.email,
				reporterId: reporterUser.id,
				reporterName: reporterUser.name,
				reporterEmail: reporterUser.email,
			})
			.from(tasks)
			.leftJoin(assigneeUser, eq(tasks.assigneeId, assigneeUser.id))
			.innerJoin(reporterUser, eq(tasks.reporterId, reporterUser.id))
			.where(and(eq(tasks.projectId, projectId), eq(tasks.id, taskId)))
			.limit(1);

		if (!row) {
			return null;
		}

		const [commentRows, activityRows] = await Promise.all([
			this.executor
				.select({
					id: taskComments.id,
					taskId: taskComments.taskId,
					body: taskComments.body,
					createdAt: taskComments.createdAt,
					updatedAt: taskComments.updatedAt,
					authorId: user.id,
					authorName: user.name,
					authorEmail: user.email,
				})
				.from(taskComments)
				.innerJoin(user, eq(taskComments.authorId, user.id))
				.where(eq(taskComments.taskId, row.id))
				.orderBy(asc(taskComments.createdAt), asc(taskComments.id)),
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
				.innerJoin(user, eq(activityLogs.actorId, user.id))
				.where(
					and(
						eq(activityLogs.projectId, projectId),
						eq(activityLogs.taskId, row.id),
					),
				)
				.orderBy(desc(activityLogs.createdAt))
				.limit(50),
		]);

		return {
			id: row.id,
			projectId: row.projectId,
			code: row.code,
			title: row.title,
			description: row.description,
			status: row.status,
			priority: row.priority,
			allowedTransitions: getAllowedTaskTransitions(row.status),
			assignee:
				row.assigneeId && row.assigneeName && row.assigneeEmail
					? {
							id: row.assigneeId,
							name: row.assigneeName,
							email: row.assigneeEmail,
						}
					: null,
			reporter: {
				id: row.reporterId,
				name: row.reporterName,
				email: row.reporterEmail,
			},
			dueDate: row.dueDate ? row.dueDate.toISOString() : null,
			comments: commentRows.map((commentRow) => ({
				id: commentRow.id,
				taskId: commentRow.taskId,
				author: {
					id: commentRow.authorId,
					name: commentRow.authorName,
					email: commentRow.authorEmail,
				},
				body: commentRow.body,
				createdAt: commentRow.createdAt.toISOString(),
				updatedAt: commentRow.updatedAt.toISOString(),
			})),
			activities: activityRows.map((activityRow) => {
				const parsedMetadata = activityLogMetadataSchema.safeParse(
					activityRow.metadata,
				);
				return {
					id: activityRow.id,
					projectId: activityRow.projectId,
					taskId: activityRow.taskId,
					actorId: activityRow.actorId,
					actorName: activityRow.actorName,
					actorEmail: activityRow.actorEmail,
					action: activityRow.action,
					metadata: parsedMetadata.success ? parsedMetadata.data : {},
					createdAt: activityRow.createdAt.toISOString(),
				};
			}),
			createdAt: row.createdAt.toISOString(),
			updatedAt: row.updatedAt.toISOString(),
		};
	}
}
