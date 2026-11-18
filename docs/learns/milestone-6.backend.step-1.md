# Milestone 6 — Backend Step 1: Shared Project Detail & Member Schemas (src/shared/schemas/)

ในขั้นตอนแรกของ Milestone 6 เราจะต่อเติมสัญญาข้อมูลกลาง (Shared Contracts) ในไฟล์ `src/shared/schemas/project.schema.ts` ให้สมบูรณ์ครอบคลุมการแสดงรายละเอียดโครงการเชิงลึก (`ProjectDetailDto`), การจัดการสมาชิกและบทบาทภายในโครงการ (`ProjectMemberDto`, `ListProjectMembersResultDto`, Input Schemas สำหรับเพิ่ม/เปลี่ยนบทบาท/ถอดสมาชิก) ตลอดจนการดึงประวัติกิจกรรมระดับโครงการ (`ActivityLogDto`, `ListProjectActivityInput`) เพื่อให้ทั้งฝั่ง Backend และ Frontend ใช้แหล่งความจริงเดียว (Single Source of Truth) ร่วมกันร้อยเปอร์เซ็นต์

---

## 1. เป้าหมายและขอบเขต Boundary (Boundary Context & Goal)

### เป้าหมายของ Step นี้
1. ต่อเติม (Additive) สัญญาข้อมูลสำหรับการดึงรายละเอียดโครงการรายตัว (`projectRoleSummarySchema`, `projectDetailDtoSchema`, `getProjectDetailInputSchema`) ซึ่งแนบบทบาท (`myRole`) และรายการสิทธิ์ระดับโครงการของผู้ใช้ปัจจุบัน (`myPermissions`) มาพร้อมกันใน Payload เดียว
2. ต่อเติม Schema สำหรับระบบบริหารจัดการสมาชิกภายในโครงการ (`projectMemberDtoSchema`, `projectRoleOptionDtoSchema`, `invitableUserDtoSchema`, `listProjectMembersResultDtoSchema`, `addProjectMemberInputSchema`, `changeProjectMemberRoleInputSchema`, `removeProjectMemberInputSchema`)
3. ต่อเติม Schema สำหรับระบบบันทึกและแสดงประวัติกิจกรรม (`activityLogMetadataSchema`, `activityLogDtoSchema`, `listProjectActivityInputSchema`)

### ตารางสรุปไฟล์ใน Step นี้

| เส้นทางไฟล์ (File Path) | บทบาทหน้าที่ (Responsibility) |
| :--- | :--- |
| `src/shared/schemas/project.schema.ts` | นิยาม Zod Schemas และ TypeScript Types ทั้งหมดของโมดูล Projects (รวมทั้งส่วนรายการโครงการจาก Milestone 5 และส่วนรายละเอียดโครงการ สมาชิก และประวัติกิจกรรมใน Milestone 6) |

### แผนผังสถาปัตยกรรมและทิศทางการพึ่งพา (Boundary Dependency Flow)

```mermaid
flowchart TD
    subgraph SHARED["src/shared/schemas/ (Isomorphic Contract Layer)"]
        PAG["pagination.schema.ts\n(Pagination Factory)"]
        RBAC["rbac.schema.ts\n(projectPermissionCodeSchema)"]
        PROJ["project.schema.ts\n(Project Detail, Member & Activity Contracts)"]
    end

    subgraph SERVER["src/server/ & src/server-functions/"]
        DOM["server/domain/projects/\n(Entities & Repository Interfaces)"]
        APP["server/application/projects/\n(Query Interfaces & Use Cases)"]
        INFRA["server/infrastructure/projects/\n(Drizzle Queries & Repository)"]
        SF["server-functions/projects/\n(RPC Validators & Return DTOs)"]
    end

    subgraph CLIENT["src/client/ & src/routes/"]
        CACHE["client/caches/projects/\n(Queries & Mutations)"]
        FEAT["client/features/projects/\n(Project Workspace, Members & Activity UI)"]
    end

    PROJ -->|imports| PAG
    PROJ -->|imports| RBAC
    DOM -->|consumes status & types| PROJ
    APP -->|consumes DTO & Input types| PROJ
    INFRA -->|validates metadata & maps DTOs| PROJ
    SF -->|validates inputs via .validator()| PROJ
    CACHE -->|types query/mutation payloads| PROJ
    FEAT -->|validates forms & renders DTOs| PROJ
```

---

## 2. ทฤษฎี ความสำคัญ และกฎสถาปัตยกรรมเฉพาะ Boundary นี้

### 2.1 กฎ Shared Schemas จาก `.agents/rules/globals.md`
การต่อเติม `src/shared/schemas/project.schema.ts` ยึดถือปฏิบัติตามกฎเหล็กของ Shared Schemas อย่างเคร่งครัด:
1. **Single Source of Truth (ข้อ 1)**: ข้อมูลทุกชนิดที่ส่งข้ามขอบเขตระหว่าง `server/` และ `client/` ต้องนิยามไว้ที่ `src/shared/schemas/**` เท่านั้น ห้ามสร้าง Interface หรือ Type ซ้ำซ้อนแยกกันในแต่ละฝั่ง
2. **Zod-First Contract (ข้อ 2)**: เริ่มต้นจากการสร้าง Zod Schema เสมอ แล้วสกัด Type ด้วย `z.infer<typeof ...>` เพื่อให้การตรวจสอบข้อมูลตอนรันไทม์ (Runtime Validation) ใน Server Functions และชนิดข้อมูลตอนคอมไพล์ (Compile-time Type) ตรงกันเสมอ
3. **Reuse Existing Contracts (ข้อ 3)**: นำเข้า `projectPermissionCodeSchema` จาก `./rbac.schema` เพื่อรับประกันว่า `myPermissions` ใน `projectDetailDtoSchema` และ `permissions` ใน `projectRoleOptionDtoSchema` จะเป็นรหัสสิทธิ์ระดับโครงการ (`scope: "project"`) ที่ถูกต้องตาม Catalog เท่านั้น

### 2.2 การออกแบบ Composite Read DTOs สำหรับหน้า Project Detail Workspace
- **`projectDetailDtoSchema`**: นอกจากข้อมูลพื้นฐานของโครงการและจำนวนสถิติ (`memberCount`, `taskCount`) แล้ว ยังแนบ `myRole` (`projectRoleSummarySchema.nullable()`) และ `myPermissions` (`z.array(projectPermissionCodeSchema)`) มาด้วย เพื่อให้หน้าจอ Project Detail บนฝั่ง Client สามารถตัดสินใจเปิด/ปิดปุ่มแก้ไขโครงการ ปุ่มลบโครงการ แท็บจัดการสมาชิก หรือปุ่มสร้างงานได้ทันทีโดยไม่ต้องยิง RPC แยกอีกเส้น
- **`listProjectMembersResultDtoSchema`**: รวบรวมข้อมูลทั้ง 3 ส่วนที่หน้าแท็บสมาชิกต้องใช้ไว้ใน Payload เดียว ได้แก่:
  1. `members`: รายชื่อสมาชิกปัจจุบันพร้อมข้อมูลบทบาทและแฟล็ก `isOwnerRole`
  2. `availableRoles`: รายการบทบาทระดับ `project` ทั้งหมดพร้อมสิทธิ์ย่อย สำหรับแสดงใน Dropdown เลือกบทบาท
  3. `invitableUsers`: รายชื่อผู้ใช้ในระบบที่ยังไม่ได้เป็นสมาชิกของโครงการนี้ สำหรับแสดงในฟอร์มเชิญสมาชิกใหม่
- **`activityLogMetadataSchema`**: ใช้ `z.record(z.string(), z.json())` ของ Zod v4 เพื่อตรวจสอบโครงสร้าง JSONB Metadata ของประวัติกิจกรรมอย่างปลอดภัยโดยไม่พึ่งพา `any`

---

## 3. ลงมือเขียนโค้ด (Step-by-Step Implementation)

### 3.1 ไฟล์ `src/shared/schemas/project.schema.ts`

เปิดไฟล์ `src/shared/schemas/project.schema.ts` และต่อเติม Schemas สำหรับรายละเอียดโครงการ การจัดการสมาชิก และประวัติกิจกรรมต่อท้ายจาก Milestone 5 โดยโค้ดฉบับเต็มทั้งไฟล์ (ครบทุกบรรทัด) มีดังนี้:

```typescript
import { z } from "zod";
import {
	createPaginatedResultSchema,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	sortOrderSchema,
} from "./pagination.schema";
import { projectPermissionCodeSchema } from "./rbac.schema";

export const PROJECT_KEY_PATTERN = /^[A-Z][A-Z0-9]{1,9}$/;

export const projectStatusSchema = z.enum(["active", "archived"]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectStatusFilterSchema = z.enum(["all", "active", "archived"]);
export type ProjectStatusFilter = z.infer<typeof projectStatusFilterSchema>;

export const projectSortFieldSchema = z.enum([
	"key",
	"name",
	"status",
	"createdAt",
	"updatedAt",
]);
export type ProjectSortField = z.infer<typeof projectSortFieldSchema>;

export const projectsSearchSchema = z.object({
	search: z.string().trim().max(100).default("").catch(""),
	status: projectStatusFilterSchema.default("all").catch("all"),
	sortBy: projectSortFieldSchema.default("updatedAt").catch("updatedAt"),
	sortOrder: sortOrderSchema.default("desc").catch("desc"),
	page: z.number().int().min(1).default(DEFAULT_PAGE).catch(DEFAULT_PAGE),
	pageSize: z
		.number()
		.int()
		.min(1)
		.max(100)
		.default(DEFAULT_PAGE_SIZE)
		.catch(DEFAULT_PAGE_SIZE),
});
export type ProjectsSearch = z.infer<typeof projectsSearchSchema>;

export const createProjectInputSchema = z.object({
	key: z
		.string()
		.trim()
		.toUpperCase()
		.min(2, "รหัสโครงการต้องมีอย่างน้อย 2 ตัวอักษร")
		.max(10, "รหัสโครงการต้องไม่เกิน 10 ตัวอักษร")
		.regex(
			PROJECT_KEY_PATTERN,
			"รหัสโครงการต้องขึ้นต้นด้วยตัวอักษรภาษาอังกฤษ A-Z และตามด้วย A-Z หรือ 0-9 เท่านั้น",
		),
	name: z
		.string()
		.trim()
		.min(2, "ชื่อโครงการต้องมีอย่างน้อย 2 ตัวอักษร")
		.max(150, "ชื่อโครงการต้องไม่เกิน 150 ตัวอักษร"),
	description: z.string().trim().max(1000, "คำอธิบายต้องไม่เกิน 1000 ตัวอักษร"),
});
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const updateProjectInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	name: z
		.string()
		.trim()
		.min(2, "ชื่อโครงการต้องมีอย่างน้อย 2 ตัวอักษร")
		.max(150, "ชื่อโครงการต้องไม่เกิน 150 ตัวอักษร"),
	description: z.string().trim().max(1000, "คำอธิบายต้องไม่เกิน 1000 ตัวอักษร"),
});
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

export const projectActionInputSchema = z.object({
	projectId: z.uuid("รหัสโปรเจกต์ไม่ถูกต้อง"),
});
export type ProjectActionInput = z.infer<typeof projectActionInputSchema>;

export const projectDtoSchema = z.object({
	id: z.uuid(),
	key: z.string(),
	name: z.string(),
	description: z.string(),
	status: projectStatusSchema,
	taskSequence: z.number().int().nonnegative(),
	createdById: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type ProjectDto = z.infer<typeof projectDtoSchema>;

export const projectListItemDtoSchema = z.object({
	id: z.uuid(),
	key: z.string(),
	name: z.string(),
	description: z.string(),
	status: projectStatusSchema,
	taskSequence: z.number().int().nonnegative(),
	createdById: z.string(),
	createdByName: z.string(),
	memberCount: z.number().int().nonnegative(),
	taskCount: z.number().int().nonnegative(),
	myRoleName: z.string().nullable(),
	canUpdate: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type ProjectListItemDto = z.infer<typeof projectListItemDtoSchema>;

export const listProjectsResultDtoSchema = createPaginatedResultSchema(
	projectListItemDtoSchema,
);
export type ListProjectsResultDto = z.infer<typeof listProjectsResultDtoSchema>;

export const projectRoleSummarySchema = z.object({
	id: z.uuid(),
	name: z.string(),
	slug: z.string(),
});
export type ProjectRoleSummary = z.infer<typeof projectRoleSummarySchema>;

export const projectDetailDtoSchema = z.object({
	id: z.uuid(),
	key: z.string(),
	name: z.string(),
	description: z.string(),
	status: projectStatusSchema,
	taskSequence: z.number().int().nonnegative(),
	createdById: z.string(),
	createdByName: z.string(),
	memberCount: z.number().int().nonnegative(),
	taskCount: z.number().int().nonnegative(),
	myRole: projectRoleSummarySchema.nullable(),
	myPermissions: z.array(projectPermissionCodeSchema),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type ProjectDetailDto = z.infer<typeof projectDetailDtoSchema>;

export const getProjectDetailInputSchema = z.object({
	projectId: z.uuid("รหัสโปรเจกต์ไม่ถูกต้อง"),
});
export type GetProjectDetailInput = z.infer<typeof getProjectDetailInputSchema>;

export const projectMemberDtoSchema = z.object({
	id: z.uuid(),
	projectId: z.uuid(),
	userId: z.string(),
	userName: z.string(),
	userEmail: z.string(),
	roleId: z.uuid(),
	roleName: z.string(),
	roleSlug: z.string(),
	isOwnerRole: z.boolean(),
	joinedAt: z.string(),
});
export type ProjectMemberDto = z.infer<typeof projectMemberDtoSchema>;

export const projectRoleOptionDtoSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	slug: z.string(),
	description: z.string(),
	isSystem: z.boolean(),
	permissions: z.array(projectPermissionCodeSchema),
});
export type ProjectRoleOptionDto = z.infer<typeof projectRoleOptionDtoSchema>;

export const invitableUserDtoSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
});
export type InvitableUserDto = z.infer<typeof invitableUserDtoSchema>;

export const listProjectMembersResultDtoSchema = z.object({
	members: z.array(projectMemberDtoSchema),
	availableRoles: z.array(projectRoleOptionDtoSchema),
	invitableUsers: z.array(invitableUserDtoSchema),
});
export type ListProjectMembersResultDto = z.infer<
	typeof listProjectMembersResultDtoSchema
>;

export const addProjectMemberInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	userId: z.string().min(1, "กรุณาเลือกผู้ใช้งาน"),
	roleId: z.uuid("กรุณาเลือกบทบาทภายในโครงการ"),
});
export type AddProjectMemberInput = z.infer<typeof addProjectMemberInputSchema>;

export const changeProjectMemberRoleInputSchema = z.object({
	projectId: z.uuid("รหัสโครงการไม่ถูกต้อง"),
	memberId: z.uuid("รหัสสมาชิกไม่ถูกต้อง"),
	roleId: z.uuid("กรุณาเลือกบทบาทภายในโครงการ"),
});
export type ChangeProjectMemberRoleInput = z.infer<
	typeof changeProjectMemberRoleInputSchema
>;

export const removeProjectMemberInputSchema = z.object({
	projectId: z.uuid("รหัสโปรเจกต์ไม่ถูกต้อง"),
	memberId: z.uuid("รหัสสมาชิกไม่ถูกต้อง"),
});
export type RemoveProjectMemberInput = z.infer<
	typeof removeProjectMemberInputSchema
>;

export const activityLogMetadataSchema = z.record(z.string(), z.json());
export type ActivityLogMetadata = z.infer<typeof activityLogMetadataSchema>;

export const activityLogDtoSchema = z.object({
	id: z.uuid(),
	projectId: z.uuid(),
	taskId: z.uuid().nullable(),
	actorId: z.string(),
	actorName: z.string(),
	actorEmail: z.string(),
	action: z.string(),
	metadata: activityLogMetadataSchema,
	createdAt: z.string(),
});
export type ActivityLogDto = z.infer<typeof activityLogDtoSchema>;

export const listProjectActivityInputSchema = z.object({
	projectId: z.uuid("รหัสโปรเจกต์ไม่ถูกต้อง"),
	limit: z.number().int().min(1).max(100).default(50).catch(50),
});
export type ListProjectActivityInput = z.infer<
	typeof listProjectActivityInputSchema
>;
```

#### คำอธิบายโค้ดส่วนที่ต่อเติมใน Milestone 6 อย่างละเอียด
- **`projectRoleSummarySchema` & `projectDetailDtoSchema` (บรรทัดที่ 115–138)**:
  - นิยามข้อมูลรายละเอียดโครงการเชิงลึก โดย `myRole` จะเป็น `null` หากผู้ใช้ที่กำลังดูหน้าจอนี้ไม่ได้เป็นสมาชิกโดยตรงของโครงการ (เช่น ผู้ดูแลระบบที่มีสิทธิ์ `project:read_all`)
  - `myPermissions` เก็บอาร์เรย์ของ `ProjectPermissionCode` ที่ผู้ใช้ได้รับจากบทบาทในโครงการนั้น
- **`getProjectDetailInputSchema` (บรรทัดที่ 140–143)**:
  - ตรวจสอบ `projectId` ให้เป็น UUID ที่ถูกต้อง ใช้ร่วมกันใน Endpoint ดึงรายละเอียดโครงการและดึงรายชื่อสมาชิก
- **`projectMemberDtoSchema`, `projectRoleOptionDtoSchema`, `invitableUserDtoSchema`, `listProjectMembersResultDtoSchema` (บรรทัดที่ 145–183)**:
  - โครงสร้างข้อมูลสมาชิกแต่ละคนมี `isOwnerRole: z.boolean()` เพื่อช่วยให้ UI แสดง Badge เจ้าของโครงการและป้องกันการกดลบหรือลดระดับบทบาทเจ้าของโครงการคนสุดท้ายได้สอดคล้องกับฝั่ง Domain
- **`addProjectMemberInputSchema`, `changeProjectMemberRoleInputSchema`, `removeProjectMemberInputSchema` (บรรทัดที่ 185–207)**:
  - Input Schemas สำหรับการเพิ่มสมาชิกใหม่ เปลี่ยนบทบาทของสมาชิกเดิม และถอดสมาชิกออกจากโครงการ
- **`activityLogMetadataSchema`, `activityLogDtoSchema`, `listProjectActivityInputSchema` (บรรทัดที่ 209–231)**:
  - รองรับการดึงประวัติกิจกรรมของโครงการ โดย `limit` กำหนดค่าเริ่มต้นไว้ที่ `50` รายการล่าสุด (สูงสุดไม่เกิน `100` รายการ) พร้อม `.catch(50)` เพื่อความทนทานต่อค่าพารามิเตอร์ที่ผิดพลาด

---

## 4. การตรวจสอบความถูกต้องและ Git Commit (Verification & Commit)

หลังจากบันทึกไฟล์ `src/shared/schemas/project.schema.ts` เรียบร้อยแล้ว ให้รันคำสั่งตรวจสอบ Type Safety และ Linter/Formatter:

```bash
bun run typecheck
bun run check
```

เมื่อไม่พบข้อผิดพลาด ให้ทำการบันทึก Commit สำหรับ Step ที่ 1:

```bash
git add src/shared/schemas/project.schema.ts
git commit -m "milestone-6.backend.step-1: Shared Project Detail, Member & Activity Schemas"
```
