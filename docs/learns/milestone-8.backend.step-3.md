# Milestone 8 — Backend Step 3: Infrastructure Workspace Queries (src/server/infrastructure/workspace/)

---

## 1. เป้าหมายและขอบเขต Boundary (Boundary Context & Goal)

ใน Step ที่ 3 ของฝั่ง Backend เราจะสร้างอะแดปเตอร์ฐานข้อมูล **`DrizzleWorkspaceQueries`** ในชั้น **Infrastructure Layer (`src/server/infrastructure/workspace/`)** เพื่อ Implement สัญญา `IWorkspaceQueries` จากชั้น Application ด้วย Drizzle ORM และ PostgreSQL

เป้าหมายสำคัญของคลาสนี้คือการดึงข้อมูลสรุปหลายมิติ (Multi-dimensional Dashboard Aggregation) และตารางงานที่ได้รับมอบหมายของผู้ใช้แบบ **Zero N+1 Queries** โดยใช้การรันคำสั่ง SQL แบบขนาน (`Promise.all`) ร่วมกับ `GROUP BY`, `EXISTS` Subquery และ `inArray` Batch Aggregation ตามกฎ `server.md` ข้อ 14 และ 15 อย่างเคร่งครัด

### ตารางสรุปไฟล์ใน Step นี้

| ลำดับ | เส้นทางไฟล์ (Path) | หน้าที่รับผิดชอบ (Responsibility) |
| :--- | :--- | :--- |
| 1 | `src/server/infrastructure/workspace/drizzle-workspace.queries.ts` | Implement `IWorkspaceQueries` ด้วย Drizzle ORM สำหรับคิวรีภาพรวมพื้นที่ทำงาน (`getWorkspaceOverview`) และตารางงานที่ได้รับมอบหมาย (`listMyAssignedTasks`) แบบขนานและปราศจาก N+1 Queries |

### แผนผังขอบเขตสถาปัตยกรรม (Architecture Boundary Diagram)

```mermaid
flowchart TD
    subgraph App["src/server/application/workspace/"]
        PORT["IWorkspaceQueries"]
    end

    subgraph Infra["src/server/infrastructure/workspace/"]
        DWQ["DrizzleWorkspaceQueries\n(drizzle-workspace.queries.ts)"]
    end

    subgraph DrizzleCore["src/server/infrastructure/drizzle/"]
        BASE["DrizzleBaseRepository\n(this.executor via AsyncLocalStorage)"]
        SCHEMA["schema.ts\n(projects, projectMembers, roles,\ntasks, taskComments, activityLogs, user)"]
    end

    subgraph PG[("PostgreSQL Database")]
        Q1["Batch 1 (Promise.all):\n1. Project Status Counts (GROUP BY)\n2. My Task Status Counts (GROUP BY)\n3. Top 5 Active Projects\n4. Latest 10 Activity Logs"]
        Q2["Batch 2 (Promise.all with inArray):\n1. Member Counts per Active Project\n2. Open Task Counts per Active Project\n3. My Role Name per Active Project"]
        Q3["My Assigned Tasks:\n1. Total Count + Paginated Rows (Promise.all)\n2. Comment Counts via inArray(taskIds)"]
    end

    DWQ -.->|implements| PORT
    DWQ -->|extends| BASE
    DWQ -->|queries| SCHEMA
    DWQ -->|executes| Q1
    DWQ -->|executes| Q2
    DWQ -->|executes| Q3
```

---

## 2. ทฤษฎี ความสำคัญ และกฎสถาปัตยกรรมเฉพาะ Boundary นี้

### 2.1 เทคนิคการป้องกัน N+1 Queries บนหน้า Dashboard (`Promise.all` + `GROUP BY` + `inArray`)
หน้า Dashboard เป็นหน้าที่ถูกเปิดบ่อยที่สุดของระบบ หากเราเขียนโค้ดแบบวนลูปคิวรีทีละโครงการ (เช่น ดึงโครงการล่าสุด 5 โครงการ แล้ววนลูป `for` เพื่อนับจำนวนสมาชิก นับจำนวนงานค้าง และหาชื่อบทบาทของผู้ใช้ทีละโครงการ) จะทำให้เกิดคำสั่ง SQL ถึง $1 + (5 \times 3) = 16$ ครั้งเฉพาะแค่ส่วนการ์ดโครงการ!

ใน `DrizzleWorkspaceQueries` เราจึงออกแบบการคิวรีเป็น Batch ดังนี้:
1. **ใน `getWorkspaceOverview`**:
   - **Batch แรก (`Promise.all` 4 คิวรีพร้อมกัน)**:
     1. นับจำนวนโครงการแยกตามสถานะ (`active` vs `archived`) ด้วย `GROUP BY projects.status` จบใน 1 คิวรี
     2. นับจำนวนงานที่มอบหมายให้ฉันแยกตามสถานะ (`todo`, `in_progress`, `in_review`, `done`) ด้วย `GROUP BY tasks.status` จบใน 1 คิวรี
     3. ดึงรายการโครงการที่เปิดใช้งานล่าสุด 5 โครงการ (`LIMIT 5`)
     4. ดึงประวัติกิจกรรมล่าสุด 10 รายการพร้อมชื่อผู้กระทำ (`INNER JOIN user`, `LIMIT 10`)
   - **Batch ที่สอง (`Promise.all` 3 คิวรีพร้อมกัน เมื่อ `activeProjectIds.length > 0`)**:
     - นำ `activeProjectIds` (สูงสุด 5 IDs) ไปคิวรีด้วย `inArray(..., activeProjectIds)` พร้อม `GROUP BY projectId` เพื่อดึงจำนวนสมาชิก (`memberCountRows`), จำนวนงานค้าง (`openTaskCountRows`) และชื่อบทบาทของผู้ใช้ในโครงการเหล่านั้น (`myRoleRows`) แล้วนำมาประกอบผ่าน `Map<string, ...>` ในหน่วยความจำด้วยความเร็วระดับ $O(1)$
2. **ใน `listMyAssignedTasks`**:
   - รัน `Promise.all` เพื่อดึงจำนวนงานทั้งหมด (`count()`) และรายการงานในหน้านั้น (`limit` + `offset`) พร้อมกัน
   - หากมีรายการงานในหน้านั้น จึงดึงจำนวนความคิดเห็นของทุกงานในหน้านั้นรวดเดียวด้วย `inArray(taskComments.taskId, pageTaskIds)` และ `GROUP BY taskComments.taskId`

### 2.2 การกรองสิทธิ์การมองเห็นโครงการด้วย `EXISTS` Subquery
เมธอด `buildVisibleProjectCondition(actorUserId)` สร้างเงื่อนไข SQL `EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = actorUserId)`:
- เมื่อ `includeAllProjects === false` เงื่อนไข `EXISTS` นี้จะถูกนำไปแนบในทุกคิวรี ทั้งการนับโครงการ การนับงานของฉัน การดึงโครงการล่าสุด และการดึงกิจกรรมล่าสุด
- การใช้ `EXISTS` แทน `INNER JOIN project_members` ในคิวรีหลักช่วยป้องกันปัญหาแถวซ้ำ (Row Multiplication) หากในอนาคตตารางความสัมพันธ์มีการขยายตัว และช่วยให้ PostgreSQL Query Planner ใช้ดัชนี `(project_id, user_id)` ทำ Semi-Join ได้อย่างรวดเร็ว

### 2.3 กฎสถาปัตยกรรมที่บังคับใช้ใน Step นี้
- **`server.md` ข้อ 14 (Single Round-Trip & Zero N+1)**: ใช้ `Promise.all`, `GROUP BY`, `inArray` และ Joins เพื่อลด Database Round-trips ให้เหลือน้อยที่สุด
- **`server.md` ข้อ 15 (CQRS Query Projections)**: คิวรีและแปลงข้อมูลออกเป็น DTO โดยตรง พร้อมตรวจสอบ JSONB Metadata ของ Activity Log ด้วย `activityLogMetadataSchema.safeParse(...)`
- **`server.md` ข้อ 16 (AsyncLocalStorage Transaction Context)**: สืบทอดจาก `DrizzleBaseRepository<AppDb, AppTx>` และเรียกใช้งานฐานข้อมูลผ่าน `this.executor` เสมอ

---

## 3. ลงมือเขียนโค้ด (Step-by-Step Implementation)

### ไฟล์ที่ 1: `src/server/infrastructure/workspace/drizzle-workspace.queries.ts`

สร้างไฟล์ `src/server/infrastructure/workspace/drizzle-workspace.queries.ts` และเขียนโค้ดฉบับเต็มทั้ง 368 บรรทัดดังนี้:

```typescript
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
```

#### คำอธิบายรายละเอียดโค้ด
1. **`SORT_COLUMN_MAP` พร้อม `satisfies Record<MyTasksSortField, unknown>`**:
   - ผูกชื่อฟิลด์การเรียงลำดับจาก `MyTasksSortField` เข้ากับคอลัมน์จริงของ Drizzle (`projects.key`, `tasks.code`, `tasks.title`, ฯลฯ) โดยให้ TypeScript ตรวจสอบว่าครบทุกฟิลด์ตาม Schema เป๊ะ
2. **การคำนวณ `assignedOpenTaskCount` และ `assignedDoneTaskCount`**:
   - รวมผลนับของสถานะ `"todo"`, `"in_progress"` และ `"in_review"` เข้าเป็น `assignedOpenTaskCount` และแยก `"done"` ออกเป็น `assignedDoneTaskCount` จากผลลัพธ์ `GROUP BY tasks.status` เพียงชุดเดียว
3. **การค้นหาข้ามตาราง (`tasks` + `projects`) ใน `listMyAssignedTasks`**:
   - ใช้ `or(ilike(tasks.code, pattern), ilike(tasks.title, pattern), ilike(projects.key, pattern), ilike(projects.name, pattern))` ทำให้ผู้ใช้สามารถพิมพ์รหัสงาน ชื่องาน รหัสโครงการ หรือชื่อโครงการในช่องค้นหาเดียวบนหน้า Dashboard ได้ทันที
   - เรียงลำดับด้วย `.orderBy(primaryOrder, asc(tasks.id))` โดยมี `asc(tasks.id)` เป็น Tie-breaker เสมอ เพื่อให้ผลลัพธ์การแบ่งหน้ามีความแน่นอน (Deterministic Pagination) แม้มีหลายงานที่ `updatedAt` หรือ `priority` เท่ากัน

---

## 4. การตรวจสอบความถูกต้องและ Git Commit (Verification & Commit)

รันคำสั่งตรวจสอบ TypeScript และ Biome Linter/Formatter:

```bash
bun run typecheck
bun run check
```

เมื่อผ่านเรียบร้อยแล้ว ให้บันทึก Git Commit สำหรับ Step นี้:

```bash
git add src/server/infrastructure/workspace/drizzle-workspace.queries.ts
git commit -m "milestone-8.backend.step-3: Infrastructure Drizzle Workspace CQRS Queries"
```
