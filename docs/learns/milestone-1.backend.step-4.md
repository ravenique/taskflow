# Milestone 1 — Backend Step 4: Server Functions Middleware Core (src/server-functions/middlewares/)

## 1. เป้าหมายและขอบเขต Boundary (Boundary Context & Goal)

ในขั้นตอนนี้ เราจะสร้าง **`domainErrorMiddleware`** ไว้ในเลเยอร์ **Server Functions Middleware Core** (`src/server-functions/middlewares/domain-error.middleware.ts`) เพื่อทำหน้าที่เป็นตัวแปลภาษา (Protocol Translator) ระหว่างข้อผิดพลาดทางธุรกิจจากชั้น Domain (`DomainError`) ให้กลายเป็นรหัสสถานะ HTTP (HTTP Status Code) ที่ถูกต้อง ณ ระดับ RPC Gateway โดยอัตโนมัติ

### ตารางสรุปไฟล์ใน Step นี้

| ลำดับ | เส้นทางไฟล์ (Path) | หน้าที่ความรับผิดชอบ (Responsibility) |
| :--- | :--- | :--- |
| 1 | `src/server-functions/middlewares/domain-error.middleware.ts` | ดักจับ `DomainError` ที่ถูกโยนขึ้นมาจาก Use Case หรือ Domain Entity แล้วกำหนด HTTP Status Code ที่เหมาะสมก่อนส่งต่อข้อผิดพลาดกลับไปยัง Client |

### แผนภาพการทำงานของ `domainErrorMiddleware` ใน RPC Gateway Pipeline

```mermaid
flowchart LR
    CLIENT["Client / TanStack Query Caches"] -->|1. RPC Call| SF["Server Function (*.fn.ts)"]
    SF -->|2. Pipeline Entry| MW["domainErrorMiddleware"]
    MW -->|3. await next()| UC["Application Use Case & Domain"]
    UC -.->|4. throws DomainError| MW
    MW -.->|5. setResponseStatus(400/403/404/409/422) & rethrow| CLIENT
```

---

## 2. ทฤษฎี ความสำคัญ และกฎสถาปัตยกรรมเฉพาะ Boundary นี้

### 2.1 ทำไมต้องสร้าง `domainErrorMiddleware` ตั้งแต่ Milestone 1?
1. **รักษาความบริสุทธิ์ของ Domain Layer (`server.md` ข้อ 7)**:
   ใน Step 3 เราออกแบบให้ `DomainError` (`ValidationDomainError`, `NotFoundDomainError`, `ConflictDomainError`, `ForbiddenDomainError`, `InvalidStateTransitionError` / Invariant Violation) รู้จักเพียง `DomainErrorCode` เชิงธุรกิจโดยไม่ผูกกับ HTTP Status Code ดังนั้นจึงต้องมีผู้รับผิดชอบในการแปลง `DomainErrorCode` เป็น HTTP Status Code ที่ชั้นขอบเขตการสื่อสาร (Transport / RPC Gateway Boundary)
2. **ลดโค้ดซ้ำซ้อนในทุก Server Function (`server.md` ข้อ 18 & `architecture.md`)**:
   หากไม่มี Middleware ตัวนี้ ทุกๆ Server Function (`*.fn.ts`) ในระบบจะต้องเขียน `try / catch` เพื่อตรวจเช็ค `instanceof DomainError` แล้วตั้งค่า HTTP Status เองซ้ำๆ กัน การแยกออกมาเป็น Cross-cutting Middleware ตั้งแต่ Milestone 1 ทำให้ทุก Server Function ที่เราจะสร้างใน Milestone ถัดๆ ไป เพียงแค่นำ `.middleware([domainErrorMiddleware])` ไปผูกใช้งาน ก็จะได้รับการจัดการข้อผิดพลาดที่สม่ำเสมอทันที

### 2.2 ตารางการจับคู่รหัสข้อผิดพลาดทางธุรกิจกับ HTTP Status Code

| คลาสข้อผิดพลาดใน Domain | รหัส `DomainErrorCode` | HTTP Status Code | ความหมายทางโปรโตคอล HTTP |
| :--- | :--- | :--- | :--- |
| `ValidationDomainError` | `"DOMAIN_VALIDATION_ERROR"` | `400` (Bad Request) | ข้อมูลที่ส่งเข้ามาไม่ผ่านกฎการตรวจสอบความถูกต้องของโดเมน |
| `ForbiddenDomainError` | `"FORBIDDEN"` | `403` (Forbidden) | ผู้ใช้ไม่มีสิทธิ์เข้าถึงหรือกระทำการต่อทรัพยากรนี้ |
| `NotFoundDomainError` | `"NOT_FOUND"` | `404` (Not Found) | ไม่พบ Entity หรือทรัพยากรที่ร้องขอในระบบ |
| `ConflictDomainError` | `"CONFLICT"` | `409` (Conflict) | ข้อมูลขัดแย้งกับสถานะปัจจุบันของระบบ (เช่น ข้อมูลซ้ำ) |
| `InvalidStateTransitionError` (Invariant Violation) | `"INVALID_STATE_TRANSITION"` | `422` (Unprocessable Entity) | รูปแบบคำขอถูกต้องแต่ไม่สามารถเปลี่ยนสถานะตามกฎ Invariant ของธุรกิจได้ |

---

## 3. ลงมือเขียนโค้ด (Step-by-Step Implementation)

### 3.1 ไฟล์ `src/server-functions/middlewares/domain-error.middleware.ts`

สร้างไฟล์ `src/server-functions/middlewares/domain-error.middleware.ts` และเขียนโค้ดฉบับเต็มดังต่อไปนี้:

```typescript
import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { DomainError } from "#/server/domain/common/errors";

const DOMAIN_ERROR_HTTP_STATUS = {
	DOMAIN_VALIDATION_ERROR: 400,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INVALID_STATE_TRANSITION: 422,
} as const;

export const domainErrorMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	try {
		return await next();
	} catch (error) {
		if (error instanceof DomainError) {
			setResponseStatus(DOMAIN_ERROR_HTTP_STATUS[error.code]);
		}
		throw error;
	}
});
```

**คำอธิบายโค้ดอย่างละเอียด:**
1. **การนำเข้าด้วย Path Alias (`#/server/domain/common/errors`)**:
   ปฏิบัติตามกฎ `globals.md` ข้อ 2 โดยใช้ Path Alias `#/` แทนการใช้ Relative Import ข้ามเลเยอร์ลึกเกิน 1 ระดับ
2. **`DOMAIN_ERROR_HTTP_STATUS`**:
   ประกาศ Lookup Table แบบ `as const` ที่จับคู่ทุกค่าของ `DomainErrorCode` เข้ากับตัวเลข HTTP Status Code อย่างครบถ้วน (Exhaustive Mapping) หากในอนาคตมีการเพิ่ม `DomainErrorCode` ใหม่ใน `errors.ts` แต่ลืมเพิ่มในตารางนี้ TypeScript Compiler จะแจ้งเตือน Type Error ที่บรรทัด `DOMAIN_ERROR_HTTP_STATUS[error.code]` ทันที
3. **`createMiddleware({ type: "function" }).server(...)`**:
   สร้าง Server Function Middleware ของ TanStack Start ที่ครอบการทำงานของ Handler ถัดไปผ่าน `await next()`
4. **การดักจับและส่งต่อข้อผิดพลาด (`catch (error)`)**:
   - เมื่อเกิดข้อผิดพลาดขึ้นระหว่างรัน Middleware ถัดไปหรือ Use Case หากตรวจสอบพบว่า `error instanceof DomainError` จะเรียกใช้ `setResponseStatus(DOMAIN_ERROR_HTTP_STATUS[error.code])` เพื่อกำหนด HTTP Status Code ให้กับ Response ของคำขอนั้น
   - จากนั้นทำการ `throw error` ต่อไปเพื่อให้ TanStack Start ส่งรายละเอียดข้อความข้อผิดพลาด (`error.message`) กลับไปยังฝั่ง Client (เช่น TanStack Query Mutation Cache) เพื่อแสดงผล Toast แจ้งเตือนผู้ใช้ได้อย่างถูกต้อง

---

## 4. การตรวจสอบความถูกต้องและ Git Commit (Verification & Commit)

ตรวจสอบความถูกต้องของโค้ดและชนิดข้อมูลด้วย Biome และ TypeScript:

```bash
# 1. ตรวจสอบ Linting, Import Ordering และ Formatting ด้วย Biome
bun run check

# 2. ตรวจสอบ Type Safety ด้วย TypeScript Compiler
bun run typecheck
```

เมื่อทุกอย่างผ่านเรียบร้อย ให้บันทึกไฟล์เข้าสู่ระบบ Git เพื่อจบขั้นตอนฝั่ง Backend ของ Milestone 1 (Steps 1–4):

```bash
git add src/server-functions/middlewares/domain-error.middleware.ts
git commit -m "milestone-1.backend.step-4: Server Functions Domain Error Middleware"
```
