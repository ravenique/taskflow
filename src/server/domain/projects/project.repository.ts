import type { ProjectPermissionCode } from "#/shared/schemas/rbac.schema";
import type { Project } from "./project.entity";
import type { ProjectMember } from "./project-member.entity";

export interface AddProjectMemberParams {
	readonly id: string;
	readonly projectId: string;
	readonly userId: string;
	readonly roleId: string;
}

export interface RecordProjectActivityParams {
	readonly projectId: string;
	readonly taskId?: string | null;
	readonly actorId: string;
	readonly action: string;
	readonly metadata?: Record<string, unknown>;
}

export interface IProjectRepository {
	findById(projectId: string): Promise<Project | null>;
	findByKey(key: string): Promise<Project | null>;
	save(project: Project): Promise<void>;
	delete(projectId: string): Promise<boolean>;
	addMember(params: AddProjectMemberParams): Promise<void>;
	findMemberById(
		projectId: string,
		memberId: string,
	): Promise<ProjectMember | null>;
	findMemberByUserId(
		projectId: string,
		userId: string,
	): Promise<ProjectMember | null>;
	saveMember(member: ProjectMember): Promise<void>;
	removeMember(projectId: string, memberId: string): Promise<boolean>;
	incrementTaskSequence(projectId: string): Promise<number>;
	countMembersWithRoleSlug(
		projectId: string,
		roleSlug: string,
	): Promise<number>;
	recordActivity(params: RecordProjectActivityParams): Promise<void>;
	getUserProjectPermissions(
		projectId: string,
		userId: string,
	): Promise<ProjectPermissionCode[]>;
}
