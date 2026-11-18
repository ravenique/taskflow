# Milestone 5 — Backend Step 6: Server Functions Projects (src/server-functions/projects/)

## 1. เป้าหมายและขอบเขต Boundary (Boundary Context & Goal)

ในขั้นตอนสุดท้ายของฝั่ง Backend ประจำ **Milestone 5** เราจะสร้าง **RPC Gateway Endpoints** ในโฟลเดอร์ **`src/server-functions/projects/`** ด้วย `createServerFn` ของ TanStack Start เพื่อเปิดทางให้ฝั่ง Client (`src/client/caches/projects/`) และ Route Loaders สามารถเรียกใช้งาน Use Cases ทั้ง 5 ตัวของโมดูล Projects ได้อย่างปลอดภัยภายใต้กฎ **Thin Driving Adapter**

### ตารางสรุปไฟล์ใน Step นี้

| ลำดับ | เส้นทางไฟล์ (Path) | HTTP Method | Middleware Guard | Validator Schema | Use Case ที่เรียกใช้ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `src/server-functions/projects/list-projects.fn.ts` | `GET` | `domainErrorMiddleware`, `requireAuthMiddleware` | `projectsSearchSchema` | `listProjectsUseCase` |
| 2 | `src/server-functions/projects/create-project.fn.ts` | `POST` | `requireSystemPermission("project:create")` | `createProjectInputSchema` | `createProjectUseCase` |
| 3 | `src/server-functions/projects/update-project.fn.ts` | `POST` | `domainErrorMiddleware`, `requireAuthMiddleware` | `updateProjectInputSchema` | `updateProjectUseCase` |
| 4 | `src/server-functions/projects/archive-project.fn.ts` | `POST` | `domainErrorMiddleware`, `requireAuthMiddleware` | `projectActionInputSchema` | `archiveProjectUseCase` |
| 5 | `src/server-functions/projects/restore-project.fn.ts` | `POST` | `domainErrorMiddleware`, `requireAuthMiddleware` | `projectActionInputSchema` | `restoreProjectUseCase` |

### แผนภาพสถาปัตยกรรมและทิศทางการพึ่งพา (Architecture & Dependency Flow)

```mermaid
flowchart LR
    CLIENT["Client Caches & Route Loaders\n(src/client/caches/projects/)"]

    subgraph ServerFunctions["src/server-functions/projects/ (RPC Gateway)"]
        LIST_FN["listProjectsFn (GET)"]
        CREATE_FN["createProjectFn (POST)"]
        UPDATE_FN["updateProjectFn (POST)"]
        ARCHIVE_FN["archiveProjectFn (POST)"]
        RESTORE_FN["restoreProjectFn (POST)"]
    end

    subgraph Middlewares["src/server-functions/middlewares/"]
        AUTH_MW["domainErrorMiddleware +\nrequireAuthMiddleware"]
        PERM_MW["requireSystemPermission('project:create')"]
    end

    subgraph Composition["src/server/composition/projects.container.ts"]
        UC["Projects Use Cases"]
    end

    CLIENT -->|RPC Call| ServerFunctions
    LIST_FN & UPDATE_FN & ARCHIVE_FN & RESTORE_FN -->|1. Auth & Error Guard| AUTH_MW
    CREATE_FN -->|1. System Permission Guard| PERM_MW
    ServerFunctions -->|2. Zod .validator() & 3. Dispatch| UC
```

---

## 2. ทฤษฎี ความสำคัญ และกฎสถาปัตยกรรมเฉพาะ Boundary นี้

### 2.1 กฎ Server Functions จาก `.agents/rules/architecture.md` และ `.agents/rules/server.md`
1. **Standard 4-Stage Pipeline (`architecture.md`)**:
   ทุก Server Function ต้องทำงานตามลำดับ 4 ขั้นตอนอย่างเคร่งครัด:
   - **ขั้นที่ 1 Middleware**: ดักจับและแปลง Domain Error ด้วย `domainErrorMiddleware` พร้อมตรวจสอบ Session ด้วย `requireAuthMiddleware` (หรือ `requireSystemPermission("project:create")` ซึ่งรวมทั้งสองตัวไว้ภายในแล้ว)
   - **ขั้นที่ 2 Validator**: ตรวจสอบความถูกต้องของ Input Payload ด้วย Zod Schema จาก `#/shared/schemas/project.schema` ผ่าน `.validator(...)`
   - **ขั้นที่ 3 Use Case Dispatch**: เรียก `.execute(...)` ของ Use Case ที่นำเข้าจาก `#/server/composition/projects.container`
   - **ขั้นที่ 4 Explicit Response DTO**: ระบุชนิดข้อมูลขากลับของ `.handler(async (...): Promise<...Dto> => ...)` ให้ตรงกับ DTO จาก Shared Schema เสมอ
2. **One Function per File (`*.fn.ts`)**:
   - แยก 1 RPC Endpoint ต่อ 1 ไฟล์ ตั้งชื่อไฟล์แบบ kebab-case ลงท้ายด้วย `.fn.ts` และตั้งชื่อตัวแปรที่ export ลงท้ายด้วย `Fn` (`listProjectsFn`, `createProjectFn`, `updateProjectFn`, `archiveProjectFn`, `restoreProjectFn`)
3. **การแบ่งระดับการตรวจสิทธิ์ (System Permission vs Project Permission)**:
   - การสร้างโครงการใหม่ (`createProjectFn`) เป็นสิทธิ์ระดับระบบ (`"project:create"`) จึงสามารถตรวจสอบตั้งแต่ชั้น Middleware ด้วย `requireSystemPermission("project:create")` ได้ทันที
   - ส่วนการแก้ไข (`updateProjectFn`), การจัดเก็บ (`archiveProjectFn`) และการกู้คืน (`restoreProjectFn`) เป็นสิทธิ์ระดับโครงการ (`"project:update"` เฉพาะภายใน `projectId` นั้นๆ) ดังนั้นที่ชั้น Middleware จึงตรวจเพียงการเข้าสู่ระบบ (`requireAuthMiddleware`) แล้วส่ง `actorUserId` เข้าไปให้ Use Case ตรวจสอบสิทธิ์ระดับโครงการผ่าน `AuthorizationService`

---

## 3. ลงมือเขียนโค้ด (Step-by-Step Implementation)

### 3.1 ไฟล์ `src/server-functions/projects/list-projects.fn.ts`

สร้างไฟล์ `src/server-functions/projects/list-projects.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { listProjectsUseCase } from "#/server/composition/projects.container";
import type { ListProjectsResultDto } from "#/shared/schemas/project.schema";
import { projectsSearchSchema } from "#/shared/schemas/project.schema";
import { requireAuthMiddleware } from "../middlewares/auth.middleware";
import { domainErrorMiddleware } from "../middlewares/domain-error.middleware";

export const listProjectsFn = createServerFn({ method: "GET" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(projectsSearchSchema)
	.handler(async ({ context, data }): Promise<ListProjectsResultDto> => {
		return listProjectsUseCase.execute({
			actorUserId: context.authSession.user.id,
			actorSystemPermissions: context.authSession.user.systemPermissions,
			payload: data,
		});
	});
```

**คำอธิบายโค้ด:**
- ใช้ `{ method: "GET" }` สำหรับการดึงรายการโครงการแบบแบ่งหน้า
- ส่ง `actorUserId`, `actorSystemPermissions` จาก `context.authSession.user` และพารามิเตอร์การค้นหา `data` (`ProjectsSearch`) เข้าสู่ `listProjectsUseCase.execute(...)`

---

### 3.2 ไฟล์ `src/server-functions/projects/create-project.fn.ts`

สร้างไฟล์ `src/server-functions/projects/create-project.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { createProjectUseCase } from "#/server/composition/projects.container";
import type { ProjectDto } from "#/shared/schemas/project.schema";
import { createProjectInputSchema } from "#/shared/schemas/project.schema";
import { requireSystemPermission } from "../middlewares/permission.middleware";

export const createProjectFn = createServerFn({ method: "POST" })
	.middleware([requireSystemPermission("project:create")])
	.validator(createProjectInputSchema)
	.handler(async ({ context, data }): Promise<ProjectDto> => {
		return createProjectUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
```

**คำอธิบายโค้ด:**
- ใช้ `requireSystemPermission("project:create")` เพื่อบังคับว่าเฉพาะผู้ใช้ที่มีสิทธิ์สร้างโครงการระดับระบบเท่านั้นจึงจะเรียก Endpoint นี้ได้
- ตรวจสอบข้อมูลขาเข้าด้วย `createProjectInputSchema` และส่งต่อไปยัง `createProjectUseCase.execute(...)`

---

### 3.3 ไฟล์ `src/server-functions/projects/update-project.fn.ts`

สร้างไฟล์ `src/server-functions/projects/update-project.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { updateProjectUseCase } from "#/server/composition/projects.container";
import type { ProjectDto } from "#/shared/schemas/project.schema";
import { updateProjectInputSchema } from "#/shared/schemas/project.schema";
import { requireAuthMiddleware } from "../middlewares/auth.middleware";
import { domainErrorMiddleware } from "../middlewares/domain-error.middleware";

export const updateProjectFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(updateProjectInputSchema)
	.handler(async ({ context, data }): Promise<ProjectDto> => {
		return updateProjectUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
```

**คำอธิบายโค้ด:**
- ตรวจสอบ Payload ด้วย `updateProjectInputSchema` (`projectId`, `name`, `description`) และส่งให้ `updateProjectUseCase` ตรวจสอบสิทธิ์ `project:update` และอัปเดตข้อมูลโครงการ

---

### 3.4 ไฟล์ `src/server-functions/projects/archive-project.fn.ts`

สร้างไฟล์ `src/server-functions/projects/archive-project.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { archiveProjectUseCase } from "#/server/composition/projects.container";
import type { ProjectDto } from "#/shared/schemas/project.schema";
import { projectActionInputSchema } from "#/shared/schemas/project.schema";
import { requireAuthMiddleware } from "../middlewares/auth.middleware";
import { domainErrorMiddleware } from "../middlewares/domain-error.middleware";

export const archiveProjectFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(projectActionInputSchema)
	.handler(async ({ context, data }): Promise<ProjectDto> => {
		return archiveProjectUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
```

**คำอธิบายโค้ด:**
- รับ `{ projectId }` ที่ตรวจสอบด้วย `projectActionInputSchema` แล้วส่งต่อไปยัง `archiveProjectUseCase.execute(...)` เพื่อเปลี่ยนสถานะโครงการเป็น `"archived"`

---

### 3.5 ไฟล์ `src/server-functions/projects/restore-project.fn.ts`

สร้างไฟล์ `src/server-functions/projects/restore-project.fn.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { restoreProjectUseCase } from "#/server/composition/projects.container";
import type { ProjectDto } from "#/shared/schemas/project.schema";
import { projectActionInputSchema } from "#/shared/schemas/project.schema";
import { requireAuthMiddleware } from "../middlewares/auth.middleware";
import { domainErrorMiddleware } from "../middlewares/domain-error.middleware";

export const restoreProjectFn = createServerFn({ method: "POST" })
	.middleware([domainErrorMiddleware, requireAuthMiddleware])
	.validator(projectActionInputSchema)
	.handler(async ({ context, data }): Promise<ProjectDto> => {
		return restoreProjectUseCase.execute({
			actorUserId: context.authSession.user.id,
			payload: data,
		});
	});
```

**คำอธิบายโค้ด:**
- รับ `{ projectId }` ที่ตรวจสอบด้วย `projectActionInputSchema` แล้วส่งต่อไปยัง `restoreProjectUseCase.execute(...)` เพื่อกู้คืนสถานะโครงการกลับเป็น `"active"`

---

## 4. การตรวจสอบความถูกต้องและ Git Commit (Verification & Commit)

ตรวจสอบความถูกต้องของโค้ดทั้งหมดในฝั่ง Backend ของ Milestone 5 ด้วย Biome, TypeScript Compiler และสคริปต์ตรวจสอบสถาปัตยกรรม:

```bash
# 1. ตรวจสอบการจัดรูปแบบและกฎ Linter ด้วย Biome
bun run check

# 2. ตรวจสอบ Type Safety ด้วย TypeScript Compiler
bun run typecheck

# 3. ตรวจสอบกฎขอบเขตสถาปัตยกรรม (Architecture Audit)
bun run audit
```

เมื่อทุกอย่างผ่านเรียบร้อยแล้ว ให้ทำการบันทึกเข้าสู่ Git Repository:

```bash
git add src/server-functions/projects/list-projects.fn.ts src/server-functions/projects/create-project.fn.ts src/server-functions/projects/update-project.fn.ts src/server-functions/projects/archive-project.fn.ts src/server-functions/projects/restore-project.fn.ts
git commit -m "milestone-5.backend.step-6: Projects Server Functions Gateway"
```
