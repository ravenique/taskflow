# Milestone 6 — Backend Step 6: Server Functions Project Detail & Members (src/server-functions/projects/)

ในขั้นตอนสุดท้ายของฝั่ง Backend ประจำ Milestone 6 เราจะสร้าง **Server Functions (`src/server-functions/projects/*.fn.ts`)** ทั้ง 7 ไฟล์ เพื่อทำหน้าที่เป็น **Thin Driving Adapter (RPC Gateway)** เชื่อมต่อระหว่างฝั่ง Client กับ Use Cases ที่เราประกอบไว้ใน `projects.container.ts` โดยทุกไฟล์ปฏิบัติตาม Standard 4-Stage Pipeline อย่างเคร่งครัด

---

## 1. เป้าหมายและขอบเขต Boundary (Boundary Context & Goal)

### เป้าหมายของ Step นี้
1. สร้าง GET Server Functions 3 รายการสำหรับดึงข้อมูลหน้า Project Detail Workspace ได้แก่ `getProjectDetailFn`, `listProjectMembersFn` และ `listProjectActivityFn`
2. สร้าง POST Server Functions 4 รายการสำหรับการลบโครงการและการบริหารจัดการสมาชิก ได้แก่ `deleteProjectFn`, `addProjectMemberFn`, `changeProjectMemberRoleFn` และ `removeProjectMemberFn`
3. บังคับใช้ Middleware (`domainErrorMiddleware`, `requireAuthMiddleware`), Input Validation ด้วย Shared Zod Schemas และ Explicit Return Types ครบทุก Endpoint

### ตารางสรุปไฟล์ใน Step นี้

| เส้นทางไฟล์ (File Path) | บทบาทหน้าที่ (Responsibility) |
| :--- | :--- |
| `src/server-functions/projects/get-project-detail.fn.ts` | RPC Endpoint (`GET`) ดึงรายละเอียดโครงการพร้อมบทบาทและสิทธิ์ของผู้ใช้ปัจจุบัน |
| `src/server-functions/projects/delete-project.fn.ts` | RPC Endpoint (`POST`) ลบโครงการอย่างถาวร |
| `src/server-functions/projects/list-project-members.fn.ts` | RPC Endpoint (`GET`) ดึงรายชื่อสมาชิก บทบาทที่เลือกได้ และผู้ใช้ที่สามารถเชิญเข้าโครงการ |
| `src/server-functions/projects/add-project-member.fn.ts` | RPC Endpoint (`POST`) เพิ่มสมาชิกใหม่เข้าสู่โครงการ |
| `src/server-functions/projects/change-project-member-role.fn.ts` | RPC Endpoint (`POST`) เปลี่ยนบทบาทของสมาชิกภายในโครงการ |
| `src/server-functions/projects/remove-project-member.fn.ts` | RPC Endpoint (`POST`) ถอดสมาชิกออกจากโครงการ |
| `src/server-functions/projects/list-project-activity.fn.ts` | RPC Endpoint (`GET`) ดึงประวัติกิจกรรมล่าสุดภายในโครงการ |

### แผนผังสถาปัตยกรรมและทิศทางการพึ่งพา (Boundary Dependency Flow)

```mermaid
flowchart LR
    subgraph CLIENT["Client Layer (Routes & TanStack Query Caches)"]
        CALLER["client/caches/projects/**"]
    end

    subgraph SF_GATEWAY["src/server-functions/projects/ (Thin RPC Gateway)"]
        MW["1. Middlewares\n(domainErrorMiddleware + requireAuthMiddleware)"]
        VAL["2. Validator\n(Shared Zod Schema from shared/schemas/project.schema.ts)"]
        FNS["3. Handler (*.fn.ts)\n(getProjectDetailFn, deleteProjectFn, listProjectMembersFn, addProjectMemberFn, changeProjectMemberRoleFn, removeProjectMemberFn, listProjectActivityFn)"]
    end

    subgraph COMP["src/server/composition/"]
        CONT["projects.container.ts\n(7 Project Detail & Member Use Cases)"]
    end

    CALLER -->|RPC Request| MW
    MW -->|context.authSession| VAL
    VAL -->|validated data| FNS
    FNS -->|4. execute() & return DTO| CONT
```

---

## 2. ทฤษฎี ความสำคัญ และกฎสถาปัตยกรรมเฉพาะ Boundary นี้

### 2.1 กฎ Server Functions & RPC Gateway จาก `.agents/rules/architecture.md` และ `server.md`
1. **Thin Driving Adapter (ข้อ 18)**: Server Functions มีหน้าที่เพียง 4 ขั้นตอนตามลำดับ:
   - รัน Middleware (`[domainErrorMiddleware, requireAuthMiddleware]`) เพื่อดักจับ `DomainError` และตรวจสอบ Session การล็อกอิน
   - ตรวจสอบความถูกต้องของ Input Payload ด้วย `.validator(...)` โดยใช้ Schema จาก `src/shared/schemas/project.schema.ts`
   - เรียก `.execute(...)` ของ Use Case ที่นำเข้าจาก `#/server/composition/projects.container`
   - คืนค่าผลลัพธ์ที่มี Explicit Return Type (`Promise<ProjectDetailDto>`, `Promise<ListProjectMembersResultDto>`, `Promise<ActivityLogDto[]>`, หรือ `Promise<{ success: true }>`)
2. **One Function per File (`*.fn.ts`)**: แยก 1 RPC Endpoint ต่อ 1 ไฟล์ ตั้งชื่อไฟล์แบบ `kebab-case.fn.ts` และตั้งชื่อตัวแปรที่ส่งออกลงท้ายด้วย `Fn` เสมอ
3. **Method Semantics (`GET` vs `POST`)**:
   - ใช้ `{ method: "GET" }` สำหรับ Read Operations (`getProjectDetailFn`, `listProjectMembersFn`, `listProjectActivityFn`)
   - ใช้ `{ method: "POST" }` สำหรับ State-changing Mutations (`deleteProjectFn`, `addProjectMemberFn`, `changeProjectMemberRoleFn`, `removeProjectMemberFn`)

---

## 3. ลงมือเขียนโค้ด (Step-by-Step Implementation)

### 3.1 ไฟล์ `src/server-functions/projects/get-project-detail.fn.ts`

สร้างไฟล์ `src/server-functions/projects/get-project-detail.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { getProjectDetailUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { ProjectDetailDto } from "#/shared/schemas/project.schema";
import { getProjectDetailInputSchema } from "#/shared/schemas/project.schema";

export const getProjectDetailFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(getProjectDetailInputSchema)
	.handler(async ({ context, data }): Promise<ProjectDetailDto> => {
		return getProjectDetailUseCase.execute({
			actorUserId: context.authSession.user.id,
			actorSystemPermissions: context.authSession.user.systemPermissions,
			payload: data,
		});
	});
```

#### คำอธิบายโค้ดอย่างละเอียด
- ตรวจสอบ `data` ด้วย `getProjectDetailInputSchema` (`{ projectId }`)
- ส่ง `actorUserId` และ `actorSystemPermissions` จาก `context.authSession.user` เข้าไปใน `getProjectDetailUseCase.execute(...)` เพื่อให้ผู้ที่มีสิทธิ์ `project:read_all` หรือสมาชิกในโครงการสามารถเข้าดูรายละเอียดโครงการได้

---

### 3.2 ไฟล์ `src/server-functions/projects/delete-project.fn.ts`

สร้างไฟล์ `src/server-functions/projects/delete-project.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { deleteProjectUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import { projectActionInputSchema } from "#/shared/schemas/project.schema";

export const deleteProjectFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(projectActionInputSchema)
	.handler(async ({ context, data }): Promise<{ success: true }> => {
		await deleteProjectUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
		return { success: true };
	});
```

#### คำอธิบายโค้ดอย่างละเอียด
- ใช้ `projectActionInputSchema` ตรวจสอบ `projectId` และเรียก `deleteProjectUseCase.execute(...)` ก่อนคืนค่า `{ success: true }`

---

### 3.3 ไฟล์ `src/server-functions/projects/list-project-members.fn.ts`

สร้างไฟล์ `src/server-functions/projects/list-project-members.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { listProjectMembersUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { ListProjectMembersResultDto } from "#/shared/schemas/project.schema";
import { getProjectDetailInputSchema } from "#/shared/schemas/project.schema";

export const listProjectMembersFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(getProjectDetailInputSchema)
	.handler(async ({ context, data }): Promise<ListProjectMembersResultDto> => {
		return listProjectMembersUseCase.execute({
			actorUserId: context.authSession.user.id,
			actorSystemPermissions: context.authSession.user.systemPermissions,
			payload: data,
		});
	});
```

#### คำอธิบายโค้ดอย่างละเอียด
- ดึงข้อมูลสมาชิกโครงการ บทบาทระดับโครงการ และรายชื่อผู้ใช้ที่สามารถเชิญเข้าโครงการได้ในรูปแบบ `ListProjectMembersResultDto`

---

### 3.4 ไฟล์ `src/server-functions/projects/add-project-member.fn.ts`

สร้างไฟล์ `src/server-functions/projects/add-project-member.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { addProjectMemberUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import { addProjectMemberInputSchema } from "#/shared/schemas/project.schema";

export const addProjectMemberFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(addProjectMemberInputSchema)
	.handler(async ({ context, data }): Promise<{ success: true }> => {
		await addProjectMemberUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
		return { success: true };
	});
```

#### คำอธิบายโค้ดอย่างละเอียด
- ตรวจสอบ `{ projectId, userId, roleId }` ด้วย `addProjectMemberInputSchema` และส่งต่อไปยัง `addProjectMemberUseCase`

---

### 3.5 ไฟล์ `src/server-functions/projects/change-project-member-role.fn.ts`

สร้างไฟล์ `src/server-functions/projects/change-project-member-role.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { changeProjectMemberRoleUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import { changeProjectMemberRoleInputSchema } from "#/shared/schemas/project.schema";

export const changeProjectMemberRoleFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(changeProjectMemberRoleInputSchema)
	.handler(async ({ context, data }): Promise<{ success: true }> => {
		await changeProjectMemberRoleUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
		return { success: true };
	});
```

#### คำอธิบายโค้ดอย่างละเอียด
- ตรวจสอบ `{ projectId, memberId, roleId }` ด้วย `changeProjectMemberRoleInputSchema` และเรียก `changeProjectMemberRoleUseCase`

---

### 3.6 ไฟล์ `src/server-functions/projects/remove-project-member.fn.ts`

สร้างไฟล์ `src/server-functions/projects/remove-project-member.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { removeProjectMemberUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import { removeProjectMemberInputSchema } from "#/shared/schemas/project.schema";

export const removeProjectMemberFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(removeProjectMemberInputSchema)
	.handler(async ({ context, data }): Promise<{ success: true }> => {
		await removeProjectMemberUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
		return { success: true };
	});
```

#### คำอธิบายโค้ดอย่างละเอียด
- ตรวจสอบ `{ projectId, memberId }` ด้วย `removeProjectMemberInputSchema` และเรียก `removeProjectMemberUseCase`

---

### 3.7 ไฟล์ `src/server-functions/projects/list-project-activity.fn.ts`

สร้างไฟล์ `src/server-functions/projects/list-project-activity.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { listProjectActivityUseCase } from "#/server/composition/projects.container";
import { requireAuthMiddleware } from "#/server-functions/middlewares/auth.middleware";
import { domainErrorMiddleware } from "#/server-functions/middlewares/domain-error.middleware";
import type { ActivityLogDto } from "#/shared/schemas/project.schema";
import { listProjectActivityInputSchema } from "#/shared/schemas/project.schema";

export const listProjectActivityFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(listProjectActivityInputSchema)
	.handler(async ({ context, data }): Promise<ActivityLogDto[]> => {
		return listProjectActivityUseCase.execute({
			actorUserId: context.authSession.user.id,
			actorSystemPermissions: context.authSession.user.systemPermissions,
			payload: data,
		});
	});
```

#### คำอธิบายโค้ดอย่างละเอียด
- ตรวจสอบ `{ projectId, limit }` ด้วย `listProjectActivityInputSchema` และคืนค่ารายการประวัติกิจกรรม `ActivityLogDto[]`

---

## 4. การตรวจสอบความถูกต้องและ Git Commit (Verification & Commit)

เมื่อสร้าง Server Functions ครบทั้ง 7 ไฟล์แล้ว ให้รันคำสั่งตรวจสอบ Type Safety, Linter และ Architecture Audit เพื่อยืนยันความถูกต้องของฝั่ง Backend ทั้งหมดใน Milestone 6:

```bash
bun run typecheck
bun run check
bun run audit
```

เมื่อทุกอย่างผ่านเรียบร้อยโดยไม่มีข้อผิดพลาด ให้ทำการ Commit สำหรับ Step ที่ 6:

```bash
git add src/server-functions/projects/get-project-detail.fn.ts src/server-functions/projects/delete-project.fn.ts src/server-functions/projects/list-project-members.fn.ts src/server-functions/projects/add-project-member.fn.ts src/server-functions/projects/change-project-member-role.fn.ts src/server-functions/projects/remove-project-member.fn.ts src/server-functions/projects/list-project-activity.fn.ts
git commit -m "milestone-6.backend.step-6: Project Detail, Members & Activity Server Functions"
```
