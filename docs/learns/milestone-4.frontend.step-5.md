# Milestone 4 — Frontend Step 5: Admin File Routes (src/routes/_auth/admin/)

ในขั้นตอนสุดท้ายของ **Milestone 4 (RBAC & User Administration)** เราจะเชื่อมโยงทุกเลเยอร์เข้าด้วยกันด้วยการสร้าง **TanStack Router File Routes** สำหรับหน้าผู้ดูแลระบบ ได้แก่ `/admin/roles` และ `/admin/users` ภายใต้ Pathless Layout Route `_auth` พร้อมกำหนด **Permission Route Guard (`beforeLoad`)** และ **Data Preloading (`loader`)**

---

## 1. เป้าหมายและขอบเขต Boundary (Boundary Context & Goal)

### เป้าหมายของ Step นี้
1. สร้าง File Route `src/routes/_auth/admin/roles/index.tsx` สำหรับ URL `/admin/roles` โดยตรวจสอบสิทธิ์ `role:read` ใน `beforeLoad`, Preload ข้อมูลด้วย `rolesListQueryOptions()` ใน `loader` และเรนเดอร์ `RolesAdminScreen`
2. สร้าง File Route `src/routes/_auth/admin/users/index.tsx` สำหรับ URL `/admin/users` โดยตรวจสอบสิทธิ์ `user:read` ใน `beforeLoad`, Preload ข้อมูลด้วย `adminUsersQueryOptions("")` ใน `loader` และเรนเดอร์ `UsersAdminScreen`
3. อัปเดต Route Tree อัตโนมัติด้วยคำสั่ง `bun run generate-routes` และทดสอบการทำงานแบบ End-to-End ครบวงจร

### ตารางสรุปไฟล์ใน Step นี้

| ลำดับ | Path ของไฟล์ | บทบาทหน้าที่ (Responsibility) |
| :--- | :--- | :--- |
| 1 | `src/routes/_auth/admin/roles/index.tsx` | File Route สำหรับ `/admin/roles` ตรวจสิทธิ์ `role:read`, Preload รายการบทบาท/สิทธิ์ และแสดง `RolesAdminScreen` |
| 2 | `src/routes/_auth/admin/users/index.tsx` | File Route สำหรับ `/admin/users` ตรวจสิทธิ์ `user:read`, Preload รายชื่อผู้ใช้งาน และแสดง `UsersAdminScreen` |

### แผนผังการทำงานของ Route Guard, Loader และ Screen (Mermaid Diagram)

```mermaid
flowchart LR
    REQ["User Navigation (/admin/roles หรือ /admin/users)"] --> AUTH_LAYOUT["src/routes/_auth.tsx (beforeLoad: ตรวจ Session)"]
    AUTH_LAYOUT -->|Unauthenticated| SIGNIN["Redirect -> /sign-in"]
    AUTH_LAYOUT -->|Authenticated (context.user)| PERM_GUARD["admin/*/index.tsx (beforeLoad: ตรวจ systemPermissions)"]
    PERM_GUARD -->|Missing role:read / user:read| HOME["Redirect -> /"]
    PERM_GUARD -->|Authorized| LOADER["loader: context.queryClient.query(...)"]
    LOADER --> SCREEN["component: RolesAdminScreen / UsersAdminScreen"]
```

---

## 2. ทฤษฎี ความสำคัญ และกฎสถาปัตยกรรมเฉพาะ Boundary นี้

### 2.1 กฎสถาปัตยกรรมที่บังคับใช้ (`architecture.md`, `client.md` & `server.md`)
1. **Route รู้เพียงว่า URL ใช้ Screen ใด (`client.md` ข้อ 1)**:
   - ไฟล์ใน `src/routes/**` มีหน้าที่เฉพาะจัดการ URL Routing, Route Guard (`beforeLoad`), การ Preload ข้อมูลเข้า Cache (`loader`) และผูก `component` เข้ากับ Screen (`RolesAdminScreen`, `UsersAdminScreen`) เท่านั้น
   - ห้ามประกอบ UI ย่อยจาก `features/**/components/*` ในไฟล์ Route โดยตรงเด็ดขาด
2. **2-Tier Route Protection (`_auth` + Permission Guard)**:
   - **ชั้นที่ 1 (`src/routes/_auth.tsx`)**: ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่ หากยังไม่ล็อกอินจะโยน `redirect({ to: "/sign-in" })` แต่หากล็อกอินแล้วจะส่งต่อ `user` (ซึ่งมี `systemPermissions` แนบมาตั้งแต่ Milestone 4 Backend) เข้าสู่ Route `context`
   - **ชั้นที่ 2 (`src/routes/_auth/admin/*/index.tsx`)**: ตรวจสอบใน `beforeLoad` ว่า `context.user.systemPermissions` มีสิทธิ์ที่จำเป็นหรือไม่ (`role:read` สำหรับหน้าบทบาท และ `user:read` สำหรับหน้าผู้ใช้งาน) หากไม่มีสิทธิ์จะโยน `redirect({ to: "/" })` ทันทีตั้งแต่ก่อนโหลดข้อมูลและก่อนเรนเดอร์หน้าจอ
3. **Zero-Waterfall Data Preloading ด้วย `loader` (`server.md` ข้อ 3)**:
   - ใน `loader` เราเรียก `context.queryClient.query(rolesListQueryOptions())` และ `context.queryClient.query(adminUsersQueryOptions(""))` เพื่อดึงข้อมูลเข้าสู่ TanStack Query Cache ตั้งแต่จังหวะเปลี่ยน Route ทำให้เมื่อ `RolesAdminScreen` และ `UsersAdminScreen` เรนเดอร์ ข้อมูลจะพร้อมใช้งานใน Cache ทันทีโดยไม่เกิดปรากฏการณ์ Fetch Waterfall

---

## 3. ลงมือเขียนโค้ด (Step-by-Step Implementation)

### 3.1 สร้าง File Route สำหรับหน้าจัดการบทบาท (`src/routes/_auth/admin/roles/index.tsx`)

สร้างไฟล์ `src/routes/_auth/admin/roles/index.tsx` เพื่อเปิดใช้งานเส้นทาง `/admin/roles`

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { rolesListQueryOptions } from "#/client/caches/rbac/queries/roles.query";
import { RolesAdminScreen } from "#/client/features/rbac/screens/roles-admin.screen";

export const Route = createFileRoute("/_auth/admin/roles/")({
	beforeLoad: ({ context }) => {
		const canReadRoles = context.user.systemPermissions.includes("role:read");
		if (!canReadRoles) {
			throw redirect({ to: "/" });
		}
	},
	loader: ({ context }) => context.queryClient.query(rolesListQueryOptions()),
	component: RolesAdminScreen,
});
```

---

### 3.2 สร้าง File Route สำหรับหน้าจัดการผู้ใช้งาน (`src/routes/_auth/admin/users/index.tsx`)

สร้างไฟล์ `src/routes/_auth/admin/users/index.tsx` เพื่อเปิดใช้งานเส้นทาง `/admin/users`

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { adminUsersQueryOptions } from "#/client/caches/users/queries/users.query";
import { UsersAdminScreen } from "#/client/features/users/screens/users-admin.screen";

export const Route = createFileRoute("/_auth/admin/users/")({
	beforeLoad: ({ context }) => {
		const canReadUsers = context.user.systemPermissions.includes("user:read");
		if (!canReadUsers) {
			throw redirect({ to: "/" });
		}
	},
	loader: ({ context }) =>
		context.queryClient.query(adminUsersQueryOptions("")),
	component: UsersAdminScreen,
});
```

---

### 3.3 สั่งสร้าง Route Tree อัตโนมัติ (`routeTree.gen.ts`)

เมื่อสร้างไฟล์ Route ทั้งสองเสร็จแล้ว ให้รันคำสั่งด้านล่างเพื่อให้ TanStack Router CLI สแกนโฟลเดอร์ `src/routes/` และอัปเดตไฟล์ `src/routeTree.gen.ts` ให้รู้จักเส้นทาง `/admin/roles` และ `/admin/users`:

```bash
bun run generate-routes
```

---

## 4. การตรวจสอบความถูกต้องและ Git Commit (Verification & Commit)

### 4.1 ตรวจสอบ Type Safety และ Linting ทั้งโปรเจกต์
รันคำสั่งตรวจสอบด้วย `bun` เพื่อยืนยันว่าทั้งโปรเจกต์ผ่านการตรวจสอบโดยไม่มีข้อผิดพลาด:

```bash
bun run typecheck
bun run format
bun run check
```

### 4.2 ขั้นตอนการทดสอบใช้งานจริงท้าย Milestone 4 (End-to-End Verification)

เริ่มต้นเซิร์ฟเวอร์พัฒนาด้วยคำสั่ง `bun run dev` (และตรวจสอบว่าได้รัน `bun run db:seed` เพื่อให้มีข้อมูลเริ่มต้นพร้อมใช้งานแล้ว) จากนั้นทดสอบตามลำดับดังนี้:

1. **เข้าสู่ระบบและตรวจสอบเมนูนำทาง (`WorkspaceNav`)**:
   - ล็อกอินด้วยบัญชีผู้ดูแลระบบ (หรือบัญชีที่ได้รับบทบาท `system_admin`)
   - สังเกตแถบส่วนหัว (`AppHeader`) จะปรากฏปุ่มเมนู **"จัดการบทบาท"** (`/admin/roles`) และ **"ผู้ใช้งาน"** (`/admin/users`)
2. **ทดสอบการสร้าง Custom Role และกำหนด Permission Matrix (`/admin/roles`)**:
   - คลิกเมนู **"จัดการบทบาท"** เพื่อเข้าสู่หน้า `/admin/roles`
   - คลิกปุ่ม **"สร้างบทบาท"** ที่มุมขวาบนของการ์ดรายการบทบาท
   - กรอกข้อมูลใน Dialog เช่น ชื่อบทบาท: `ผู้ตรวจสอบความปลอดภัย`, รหัสอ้างอิง: `security_auditor`, ระดับสิทธิ์: `System Level (system)`, คำอธิบาย: `ตรวจสอบรายชื่อผู้ใช้งานและบทบาทในระบบ` แล้วคลิก **"สร้างบทบาท"**
   - ระบบจะแสดง Toast `"สร้างบทบาทใหม่สำเร็จ"` และสลับมาเลือกบทบาท `ผู้ตรวจสอบความปลอดภัย` บนตารางสิทธิ์ด้านขวาโดยอัตโนมัติ
   - บนการ์ดตารางสิทธิ์ ให้ติ๊กเลือกสิทธิ์ `role:read` และ `user:read` จากนั้นคลิกปุ่ม **"บันทึกสิทธิ์"** ระบบจะแสดง Toast `"บันทึกสิทธิ์ของบทบาทสำเร็จ"`
3. **ทดสอบการป้องกันการลบ System Role และทดสอบการลบ Custom Role**:
   - สังเกตในรายการบทบาทด้านซ้าย: บทบาทมาตรฐานของระบบ (`system_admin`, `member`, `project_owner` ฯลฯ ที่มี `isSystem: true`) จะมีไอคอนแม่กุญแจและ **ไม่มีปุ่มถังขยะ** ให้กดลบ
   - สำหรับบทบาท `ผู้ตรวจสอบความปลอดภัย` ที่เราสร้างเอง (`isSystem: false`) จะมีปุ่มไอคอนถังขยะแสดงอยู่ สามารถคลิกเพื่อเปิด Dialog ยืนยันการลบได้
4. **ทดสอบการค้นหาและมอบหมายบทบาทให้ผู้ใช้งาน (`/admin/users`)**:
   - คลิกเมนู **"ผู้ใช้งาน"** เพื่อเข้าสู่หน้า `/admin/users`
   - ทดสอบพิมพ์ชื่อหรืออีเมลในช่องค้นหา ระบบจะกรองตารางแบบ Debounce (250ms) พร้อมอัปเดตจำนวนบัญชีที่พบ
   - คลิกปุ่ม **"กำหนดบทบาท"** ในแถวของผู้ใช้งานที่ต้องการ จะปรากฏ Dialog แสดงรายการบทบาทระดับ `system` ทั้งหมด (รวมถึง Custom Role ระดับ `system` ที่เพิ่งสร้าง)
   - ติ๊กเลือกบทบาทที่ต้องการแล้วคลิก **"บันทึกบทบาท"** ระบบจะแสดง Toast `"กำหนดบทบาทระบบให้ผู้ใช้งานสำเร็จ"` และอัปเดต Badge ในคอลัมน์ `System Roles` ของตารางรวมถึงสิทธิ์ใน Session ทันที

### 4.3 บันทึกการเปลี่ยนแปลงลง Git (Git Commit)
เมื่อทดสอบครบถ้วนแล้ว ให้ Stage ไฟล์ Route และไฟล์ `routeTree.gen.ts` แล้วทำการ Commit ปิดท้าย Milestone 4:

```bash
git add src/routes/_auth/admin/ src/routeTree.gen.ts
git commit -m "milestone-4.frontend.step-5: Admin Roles & Users File Routes"
```
