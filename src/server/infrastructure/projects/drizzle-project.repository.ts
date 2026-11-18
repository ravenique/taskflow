import { and, count, eq, sql } from "drizzle-orm";
import { Project } from "#/server/domain/projects/project.entity";
import {
	ProjectKeyAlreadyExistsError,
	ProjectMemberAlreadyExistsError,
	ProjectNotFoundError,
} from "#/server/domain/projects/project.errors";
import type {
	AddProjectMemberParams,
	IProjectRepository,
	RecordProjectActivityParams,
} from "#/server/domain/projects/project.repository";
import { ProjectKey } from "#/server/domain/projects/project-key.vo";
import { ProjectMember } from "#/server/domain/projects/project-member.entity";
import { DrizzleBaseRepository } from "#/server/infrastructure/drizzle/base.repository";
import type { AppDb, AppTx } from "#/server/infrastructure/drizzle/db";
import { hasPgErrorCode } from "#/server/infrastructure/drizzle/pg-error";
import {
	activityLogs,
	permissions,
	projectMembers,
	projects,
	rolePermissions,
	roles,
} from "#/server/infrastructure/drizzle/schema";
import type { ProjectPermissionCode } from "#/shared/schemas/rbac.schema";
import { projectPermissionCodeSchema } from "#/shared/schemas/rbac.schema";

type ProjectRow = typeof projects.$inferSelect;

export class DrizzleProjectRepository
	extends DrizzleBaseRepository<AppDb, AppTx>
	implements IProjectRepository
{
	async findById(projectId: string): Promise<Project | null> {
		const [row] = await this.executor
			.select()
			.from(projects)
			.where(eq(projects.id, projectId))
			.limit(1);

		return row ? this.toEntity(row) : null;
	}

	async findByKey(key: string): Promise<Project | null> {
		const normalizedKey = key.trim().toUpperCase();
		const [row] = await this.executor
			.select()
			.from(projects)
			.where(eq(projects.key, normalizedKey))
			.limit(1);

		return row ? this.toEntity(row) : null;
	}

	async save(project: Project): Promise<void> {
		try {
			await this.executor
				.insert(projects)
				.values({
					id: project.id,
					key: project.key.value,
					name: project.name,
					description: project.description,
					status: project.status,
					taskSequence: project.taskSequence,
					createdById: project.createdById,
					createdAt: project.createdAt,
					updatedAt: project.updatedAt,
				})
				.onConflictDoUpdate({
					target: projects.id,
					set: {
						name: project.name,
						description: project.description,
						status: project.status,
						taskSequence: project.taskSequence,
						updatedAt: project.updatedAt,
					},
				});
		} catch (error) {
			if (hasPgErrorCode(error, "23505")) {
				throw new ProjectKeyAlreadyExistsError(project.key.value);
			}
			throw error;
		}
	}

	async delete(projectId: string): Promise<boolean> {
		const deleted = await this.executor
			.delete(projects)
			.where(eq(projects.id, projectId))
			.returning({ id: projects.id });

		return deleted.length > 0;
	}

	async addMember(params: AddProjectMemberParams): Promise<void> {
		await this.executor.insert(projectMembers).values({
			id: params.id,
			projectId: params.projectId,
			userId: params.userId,
			roleId: params.roleId,
		});
	}

	async findMemberById(
		projectId: string,
		memberId: string,
	): Promise<ProjectMember | null> {
		const [row] = await this.executor
			.select({
				id: projectMembers.id,
				projectId: projectMembers.projectId,
				userId: projectMembers.userId,
				roleId: projectMembers.roleId,
				roleSlug: roles.slug,
				joinedAt: projectMembers.joinedAt,
			})
			.from(projectMembers)
			.innerJoin(roles, eq(projectMembers.roleId, roles.id))
			.where(
				and(
					eq(projectMembers.id, memberId),
					eq(projectMembers.projectId, projectId),
				),
			)
			.limit(1);

		return row ? ProjectMember.reconstitute(row.id, row) : null;
	}

	async findMemberByUserId(
		projectId: string,
		userId: string,
	): Promise<ProjectMember | null> {
		const [row] = await this.executor
			.select({
				id: projectMembers.id,
				projectId: projectMembers.projectId,
				userId: projectMembers.userId,
				roleId: projectMembers.roleId,
				roleSlug: roles.slug,
				joinedAt: projectMembers.joinedAt,
			})
			.from(projectMembers)
			.innerJoin(roles, eq(projectMembers.roleId, roles.id))
			.where(
				and(
					eq(projectMembers.projectId, projectId),
					eq(projectMembers.userId, userId),
				),
			)
			.limit(1);

		return row ? ProjectMember.reconstitute(row.id, row) : null;
	}

	async saveMember(member: ProjectMember): Promise<void> {
		try {
			await this.executor
				.insert(projectMembers)
				.values({
					id: member.id,
					projectId: member.projectId,
					userId: member.userId,
					roleId: member.roleId,
					joinedAt: member.joinedAt,
				})
				.onConflictDoUpdate({
					target: projectMembers.id,
					set: {
						roleId: member.roleId,
					},
				});
		} catch (error) {
			if (hasPgErrorCode(error, "23505")) {
				throw new ProjectMemberAlreadyExistsError();
			}
			throw error;
		}
	}

	async removeMember(projectId: string, memberId: string): Promise<boolean> {
		const deleted = await this.executor
			.delete(projectMembers)
			.where(
				and(
					eq(projectMembers.id, memberId),
					eq(projectMembers.projectId, projectId),
				),
			)
			.returning({ id: projectMembers.id });

		return deleted.length > 0;
	}

	async incrementTaskSequence(projectId: string): Promise<number> {
		const [updated] = await this.executor
			.update(projects)
			.set({
				taskSequence: sql`${projects.taskSequence} + 1`,
				updatedAt: new Date(),
			})
			.where(eq(projects.id, projectId))
			.returning({ taskSequence: projects.taskSequence });

		if (!updated) {
			throw new ProjectNotFoundError(projectId);
		}

		return updated.taskSequence;
	}

	async countMembersWithRoleSlug(
		projectId: string,
		roleSlug: string,
	): Promise<number> {
		const [row] = await this.executor
			.select({ total: count() })
			.from(projectMembers)
			.innerJoin(roles, eq(projectMembers.roleId, roles.id))
			.where(
				and(eq(projectMembers.projectId, projectId), eq(roles.slug, roleSlug)),
			);

		return Number(row?.total ?? 0);
	}

	async recordActivity(params: RecordProjectActivityParams): Promise<void> {
		await this.executor.insert(activityLogs).values({
			projectId: params.projectId,
			taskId: params.taskId ?? null,
			actorId: params.actorId,
			action: params.action,
			metadata: params.metadata ?? {},
		});
	}

	async getUserProjectPermissions(
		projectId: string,
		userId: string,
	): Promise<ProjectPermissionCode[]> {
		const rows = await this.executor
			.select({
				permissionCode: permissions.code,
			})
			.from(projectMembers)
			.innerJoin(roles, eq(projectMembers.roleId, roles.id))
			.innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
			.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
			.where(
				and(
					eq(projectMembers.projectId, projectId),
					eq(projectMembers.userId, userId),
					eq(roles.scope, "project"),
				),
			);

		const permissionSet = new Set<ProjectPermissionCode>();
		for (const row of rows) {
			const parsed = projectPermissionCodeSchema.safeParse(row.permissionCode);
			if (parsed.success) {
				permissionSet.add(parsed.data);
			}
		}

		return [...permissionSet];
	}

	private toEntity(row: ProjectRow): Project {
		return Project.reconstitute(row.id, {
			key: ProjectKey.reconstitute(row.key),
			name: row.name,
			description: row.description,
			status: row.status,
			taskSequence: row.taskSequence,
			createdById: row.createdById,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		});
	}
}
