import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// ============================================================================
// 1. PostgreSQL Enums (Finite Domain States & Scopes)
// ============================================================================

export const roleScopeEnum = pgEnum("role_scope", ["system", "project"]);
export const projectStatusEnum = pgEnum("project_status", [
	"active",
	"archived",
]);
export const taskStatusEnum = pgEnum("task_status", [
	"todo",
	"in_progress",
	"in_review",
	"done",
	"cancelled",
]);
export const taskPriorityEnum = pgEnum("task_priority", [
	"low",
	"medium",
	"high",
	"urgent",
]);

// ============================================================================
// 2. Better Auth Core Tables
// ============================================================================

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ============================================================================
// 3. Hybrid Dynamic RBAC Tables (role:permission)
// ============================================================================

export const permissions = pgTable(
	"permissions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		code: varchar("code", { length: 100 }).notNull().unique(),
		scope: roleScopeEnum("scope").notNull(),
		description: text("description").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("permissions_scope_idx").on(table.scope)],
);

export const roles = pgTable(
	"roles",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		slug: varchar("slug", { length: 100 }).notNull().unique(),
		scope: roleScopeEnum("scope").notNull(),
		description: text("description").notNull().default(""),
		isSystem: boolean("is_system").notNull().default(false),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("roles_scope_idx").on(table.scope)],
);

export const rolePermissions = pgTable(
	"role_permissions",
	{
		roleId: uuid("role_id")
			.notNull()
			.references(() => roles.id, { onDelete: "cascade" }),
		permissionId: uuid("permission_id")
			.notNull()
			.references(() => permissions.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.roleId, table.permissionId] }),
		index("role_permissions_permission_id_idx").on(table.permissionId),
	],
);

export const userRoles = pgTable(
	"user_roles",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		roleId: uuid("role_id")
			.notNull()
			.references(() => roles.id, { onDelete: "cascade" }),
		assignedAt: timestamp("assigned_at").defaultNow().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.roleId] }),
		index("user_roles_role_id_idx").on(table.roleId),
	],
);

// ============================================================================
// 4. Projects, Tasks, Comments & Activity Logs
// ============================================================================

export const projects = pgTable(
	"projects",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		key: varchar("key", { length: 10 }).notNull().unique(),
		name: varchar("name", { length: 150 }).notNull(),
		description: text("description").notNull().default(""),
		status: projectStatusEnum("status").notNull().default("active"),
		taskSequence: integer("task_sequence").notNull().default(0),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("projects_status_idx").on(table.status),
		index("projects_created_by_id_idx").on(table.createdById),
	],
);

export const projectMembers = pgTable(
	"project_members",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		roleId: uuid("role_id")
			.notNull()
			.references(() => roles.id, { onDelete: "restrict" }),
		joinedAt: timestamp("joined_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("project_members_project_user_uidx").on(
			table.projectId,
			table.userId,
		),
		index("project_members_user_id_idx").on(table.userId),
		index("project_members_role_id_idx").on(table.roleId),
	],
);

export const tasks = pgTable(
	"tasks",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		code: varchar("code", { length: 24 }).notNull().unique(),
		title: varchar("title", { length: 200 }).notNull(),
		description: text("description").notNull().default(""),
		status: taskStatusEnum("status").notNull().default("todo"),
		priority: taskPriorityEnum("priority").notNull().default("medium"),
		assigneeId: text("assignee_id").references(() => user.id, {
			onDelete: "set null",
		}),
		reporterId: text("reporter_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		dueDate: timestamp("due_date"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("tasks_project_status_idx").on(table.projectId, table.status),
		index("tasks_project_priority_idx").on(table.projectId, table.priority),
		index("tasks_assignee_id_idx").on(table.assigneeId),
	],
);

export const taskComments = pgTable(
	"task_comments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		body: text("body").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("task_comments_task_id_idx").on(table.taskId)],
);

export const activityLogs = pgTable(
	"activity_logs",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		taskId: uuid("task_id").references(() => tasks.id, {
			onDelete: "set null",
		}),
		actorId: text("actor_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		action: varchar("action", { length: 80 }).notNull(),
		metadata: jsonb("metadata")
			.$type<Record<string, unknown>>()
			.notNull()
			.default({}),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("activity_logs_project_created_idx").on(
			table.projectId,
			table.createdAt,
		),
		index("activity_logs_task_id_idx").on(table.taskId),
	],
);

// ============================================================================
// 5. Drizzle Relational Definitions (for db.query API)
// ============================================================================

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	userRoles: many(userRoles),
	projectMemberships: many(projectMembers),
	createdProjects: many(projects),
	assignedTasks: many(tasks, { relationName: "taskAssignee" }),
	reportedTasks: many(tasks, { relationName: "taskReporter" }),
	taskComments: many(taskComments),
	activityLogs: many(activityLogs),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const roleRelations = relations(roles, ({ many }) => ({
	rolePermissions: many(rolePermissions),
	userRoles: many(userRoles),
	projectMembers: many(projectMembers),
}));

export const permissionRelations = relations(permissions, ({ many }) => ({
	rolePermissions: many(rolePermissions),
}));

export const rolePermissionRelations = relations(
	rolePermissions,
	({ one }) => ({
		role: one(roles, {
			fields: [rolePermissions.roleId],
			references: [roles.id],
		}),
		permission: one(permissions, {
			fields: [rolePermissions.permissionId],
			references: [permissions.id],
		}),
	}),
);

export const userRoleRelations = relations(userRoles, ({ one }) => ({
	user: one(user, { fields: [userRoles.userId], references: [user.id] }),
	role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [projects.createdById],
		references: [user.id],
	}),
	members: many(projectMembers),
	tasks: many(tasks),
	activityLogs: many(activityLogs),
}));

export const projectMemberRelations = relations(projectMembers, ({ one }) => ({
	project: one(projects, {
		fields: [projectMembers.projectId],
		references: [projects.id],
	}),
	user: one(user, { fields: [projectMembers.userId], references: [user.id] }),
	role: one(roles, { fields: [projectMembers.roleId], references: [roles.id] }),
}));

export const taskRelations = relations(tasks, ({ one, many }) => ({
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id],
	}),
	assignee: one(user, {
		fields: [tasks.assigneeId],
		references: [user.id],
		relationName: "taskAssignee",
	}),
	reporter: one(user, {
		fields: [tasks.reporterId],
		references: [user.id],
		relationName: "taskReporter",
	}),
	comments: many(taskComments),
	activityLogs: many(activityLogs),
}));

export const taskCommentRelations = relations(taskComments, ({ one }) => ({
	task: one(tasks, {
		fields: [taskComments.taskId],
		references: [tasks.id],
	}),
	author: one(user, {
		fields: [taskComments.authorId],
		references: [user.id],
	}),
}));

export const activityLogRelations = relations(activityLogs, ({ one }) => ({
	project: one(projects, {
		fields: [activityLogs.projectId],
		references: [projects.id],
	}),
	task: one(tasks, {
		fields: [activityLogs.taskId],
		references: [tasks.id],
	}),
	actor: one(user, {
		fields: [activityLogs.actorId],
		references: [user.id],
	}),
}));

// ============================================================================
// 6. Named Schema Registry (หลีกเลี่ยง import * as schema ตามกฎ Biome)
// ============================================================================

export const dbSchema = {
	roleScopeEnum,
	projectStatusEnum,
	taskStatusEnum,
	taskPriorityEnum,
	user,
	session,
	account,
	verification,
	permissions,
	roles,
	rolePermissions,
	userRoles,
	projects,
	projectMembers,
	tasks,
	taskComments,
	activityLogs,
	userRelations,
	sessionRelations,
	accountRelations,
	roleRelations,
	permissionRelations,
	rolePermissionRelations,
	userRoleRelations,
	projectRelations,
	projectMemberRelations,
	taskRelations,
	taskCommentRelations,
	activityLogRelations,
};
