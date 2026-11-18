# Milestone 3 — Frontend Step 1: Client Caches Auth (src/client/caches/auth/)

ในขั้นตอนนี้เราจะเริ่มสร้างฝั่ง Frontend ของระบบยืนยันตัวตน (Authentication) และสิทธิ์ระดับระบบ (System RBAC) โดยเริ่มจากเลเยอร์ล่างสุดของฝั่ง Client ที่ทำหน้าที่เชื่อมต่อกับ `server-functions/auth/` นั่นคือ **Client Caches (`src/client/caches/auth/`)** ด้วย TanStack Query

---

## 1. เป้าหมายและขอบเขต Boundary (Boundary Context & Goal)

เป้าหมายของ Step นี้คือการสร้างศูนย์กลางจัดการ Server State สำหรับข้อมูล Session และคำสั่งเปลี่ยนแปลงสถานะการยืนยันตัวตน (Sign-in, Sign-up, Sign-out และ Auth Check) โดยแยก Network I/O, การจัดการ Cache Key, การ Sync ข้อมูล Session หลังล็อกอิน, การล้างข้อมูลทั้งหมดเมื่อออกจากระบบ และการแจ้งเตือน (Toast Feedback) ออกจาก UI และ Feature Hooks อย่างเด็ดขาด

### ตารางสรุปไฟล์ใน Step นี้

| ลำดับ | เส้นทางไฟล์ (File Path) | หน้าที่ความรับผิดชอบ (Responsibility) |
| :--- | :--- | :--- |
| 1 | `src/client/caches/auth/keys.ts` | Query Key Factory สำหรับสร้าง Cache Key ของโมดูล `auth` แบบ Type-safe |
| 2 | `src/client/caches/auth/queries/session.query.ts` | กำหนด `sessionQueryOptions()` สำหรับดึงข้อมูล Session ปัจจุบันจาก `getSessionFn` พร้อมตั้งค่า `staleTime` |
| 3 | `src/client/caches/auth/mutates/sign-in.mutate.ts` | Mutation Hook สำหรับเข้าสู่ระบบ (`signInFn`) พร้อมโหลด Session Cache ใหม่ทันทีเมื่อสำเร็จ |
| 4 | `src/client/caches/auth/mutates/sign-up.mutate.ts` | Mutation Hook สำหรับสมัครสมาชิกใหม่ (`signUpFn`) พร้อมโหลด Session Cache ใหม่ทันทีเมื่อสำเร็จ |
| 5 | `src/client/caches/auth/mutates/sign-out.mutate.ts` | Mutation Hook สำหรับออกจากระบบ (`signOutFn`) พร้อมล้าง Cache ทั้งระบบ (`queryClient.clear()`) และเซ็ต Session เป็น `null` |
| 6 | `src/client/caches/auth/mutates/verify-auth-check.mutate.ts` | Mutation Hook สำหรับทดสอบเรียก Endpoint ที่ป้องกันด้วย `requireAuthMiddleware` (`getAuthCheckFn`) |

### แผนผังสถาปัตยกรรมและการไหลของข้อมูล (Architecture & Data Flow)

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer (Routes & Feature Hooks)"]
        RG["Route Guards (beforeLoad)\n_public / _auth"]
        FH["Feature Hooks\nuseSession / useSignInForm / useSignUpForm\nuseAuthHeaderControls / useWorkspaceSession"]
    end

    subgraph AuthCache["src/client/caches/auth/ (Server-State Boundary)"]
        KEYS["keys.ts\nauthKeys.session()"]
        SQ["queries/session.query.ts\nsessionQueryOptions()"]
        M_IN["mutates/sign-in.mutate.ts\nuseSignInMutation()"]
        M_UP["mutates/sign-up.mutate.ts\nuseSignUpMutation()"]
        M_OUT["mutates/sign-out.mutate.ts\nuseSignOutMutation()"]
        M_CHK["mutates/verify-auth-check.mutate.ts\nuseVerifyAuthCheckMutation()"]
    end

    subgraph GlobalCache["src/client/caches/global.ts"]
        MC["Global MutationCache\n(Auto Toast from meta.successToast / errorToast)"]
    end

    subgraph RPCGateway["src/server-functions/auth/ (RPC Gateway)"]
        SF_SES["get-session.fn.ts"]
        SF_IN["sign-in.fn.ts"]
        SF_UP["sign-up.fn.ts"]
        SF_OUT["sign-out.fn.ts"]
        SF_CHK["get-auth-check.fn.ts"]
    end

    RG -->|query| SQ
    FH -->|useQuery| SQ
    FH -->|useMutation| M_IN
    FH -->|useMutation| M_UP
    FH -->|useMutation| M_OUT
    FH -->|useMutation| M_CHK

    SQ -->|uses key| KEYS
    M_IN -->|refetches with staleTime: 0| SQ
    M_UP -->|refetches with staleTime: 0| SQ
    M_OUT -->|clear() & setQueryData(null)| KEYS

    M_IN -.->|meta.successToast| MC
    M_UP -.->|meta.successToast| MC
    M_OUT -.->|meta.successToast| MC
    M_CHK -.->|meta.successToast| MC

    SQ -->|invokes| SF_SES
    M_IN -->|invokes| SF_IN
    M_UP -->|invokes| SF_UP
    M_OUT -->|invokes| SF_OUT
    M_CHK -->|invokes| SF_CHK
```

---

## 2. ทฤษฎี ความสำคัญ และกฎสถาปัตยกรรมเฉพาะ Boundary นี้

### 2.1 ทำไมต้องห้าม Component หรือ Feature Hook เรียก `server-functions` โดยตรง?
ตามกฎสถาปัตยกรรมใน `.agents/rules/server.md` (ข้อ 3) และ `.agents/rules/architecture.md`:
- **Ownership ของ Server State ต้องอยู่ที่เดียว**: อนุญาตให้เฉพาะ Route (`beforeLoad`, `loader`) และ `src/client/caches/**` เท่านั้นที่เรียก `server-functions/` ได้ ห้าม Screen, Component หรือ Feature Hook เรียกใช้ `server-functions/` โดยตรงเด็ดขาด
- **Reusable Query Options**: การสร้าง `sessionQueryOptions()` ด้วยฟังก์ชัน `queryOptions` ของ TanStack Query ช่วยให้เราสามารถนำตัวเลือกชุดเดียวกันนี้ไปใช้ได้ทั้งในระดับ Router (`context.queryClient.query(sessionQueryOptions())` ใน `beforeLoad` เพื่อทำ Route Guard แบบ SSR-ready) และในระดับ React Hook (`useQuery(sessionQueryOptions())`) โดยใช้ Cache ก้อนเดียวกัน ไม่ยิง Request ซ้ำซ้อน

### 2.2 กลยุทธ์การจัดการ Session Cache Lifecycle
1. **การตั้งค่า `staleTime: 60_000` (1 นาที) ใน `sessionQueryOptions()`**:
   - เนื่องจากทุกการเปลี่ยนหน้า (Route Navigation) ใน `_auth` และ `_public` จะมีการเรียก `beforeLoad` เพื่อตรวจสอบสถานะล็อกอิน หากไม่มี `staleTime` ที่เหมาะสม การคลิกเปลี่ยนหน้าทุกครั้งจะยิง RPC ไปหา Server ซ้ำๆ การกำหนด `staleTime: 60_000` ทำให้ภายใน 1 นาที TanStack Query จะอ่านข้อมูล Session จาก Memory Cache ทันที ช่วยให้การสลับหน้าลื่นไหลแบบ Zero Latency
2. **การบังคับโหลด Session ใหม่ทันทีหลัง Sign-in / Sign-up สำเร็จ (`staleTime: 0`)**:
   - เมื่อผู้ใช้เข้าสู่ระบบหรือสมัครสมาชิกผ่าน `useSignInMutation` หรือ `useSignUpMutation` สำเร็จ เซิร์ฟเวอร์จะส่ง Header `set-cookie` กลับมาเก็บไว้ในเบราว์เซอร์
   - ใน `onSuccess` เราสั่ง `await queryClient.query({ ...sessionQueryOptions(), staleTime: 0 })` เพื่อบังคับให้ TanStack Query ข้าม `staleTime` เดิมแล้วดึงข้อมูล Session ล่าสุด (พร้อม `systemRoles` และ `systemPermissions`) มาลง Cache ให้เสร็จสิ้นก่อนที่ `mutateAsync` จะ resolve ทำให้เมื่อ Hook สั่ง `navigate({ to: "/" })` หน้าถัดไปจะมีข้อมูล Session พร้อมใช้งานทันทีโดยไม่เกิดอาการกระพริบ (Flash of Unauthenticated Content)
3. **การล้าง Cache ทั้งระบบเมื่อ Sign-out (`queryClient.clear()` + `setQueryData`)**:
   - เมื่อผู้ใช้ออกจากระบบผ่าน `useSignOutMutation` ข้อมูลของโปรเจกต์ งาน หรือข้อมูลส่วนตัวของผู้ใช้คนเดิมที่เคยถูกเก็บไว้ใน TanStack Query Cache จะต้องถูกลบทิ้งทั้งหมดเพื่อป้องกันข้อมูลรั่วไหลข้ามบัญชี (Cross-Account Data Leakage) เมื่อมีผู้ใช้อื่นมาล็อกอินต่อในเบราว์เซอร์เดียวกัน
   - เราจึงเรียก `queryClient.clear()` เพื่อล้างทุก Query ในระบบ ตามด้วย `queryClient.setQueryData(authKeys.session(), null)` เพื่อบันทึกค่า `null` ลงในช่องเก็บ Session ทันที ทำให้ Route Guard และ Header UI รับรู้สถานะการออกจากระบบได้ทันทีโดยไม่ต้องยิง Request ไปถาม Server ซ้ำ

### 2.3 การจัดการ Toast Feedback แบบรวมศูนย์ผ่าน `meta.successToast`
ตามกฎ `.agents/rules/client.md` (ข้อ 8):
- **Success/Error ของ Mutation เป็นส่วนหนึ่งของ Server-State Lifecycle และควรมี Owner เดียว**: ห้ามใส่ `toast` ของการสร้าง/แก้ไข/ลบ หรือการล็อกอินกระจายอยู่ใน Screen, Component หรือ Feature Hook
- ใน `src/client/caches/global.ts` เราได้ลงทะเบียน `MutationCache` ระดับ Global ไว้แล้ว ซึ่งจะคอยดักจับทุก Mutation ที่ทำงานสำเร็จ (`onSuccess`) แล้วตรวจสอบค่า `mutation.meta?.successToast` เพื่อแสดง Toast อัตโนมัติ ส่วนกรณีเกิดข้อผิดพลาด (`onError`) ก็จะดึงข้อความ Error มาแสดง Toast สีแดงให้อัตโนมัติเช่นกัน
- ดังนั้น ในไฟล์ `*.mutate.ts` เราเพียงแค่ระบุ `meta: { successToast: "..." }` เท่านั้น โค้ดในชั้น UI และ Hook จะสะอาดและไม่ต้องพึ่งพา Toast Library เลย

---

## 3. ลงมือเขียนโค้ด (Step-by-Step Implementation)

### 3.1 สร้าง Query Key Factory สำหรับ Auth (`src/client/caches/auth/keys.ts`)

สร้างไฟล์ `src/client/caches/auth/keys.ts` เพื่อรวบรวม Query Keys ของโมดูล `auth` ให้เป็นระเบียบและปลอดภัยต่อ Type System:

```typescript
export const authKeys = {
	all: ["auth"] as const,
	session: () => [...authKeys.all, "session"] as const,
};
```

**คำอธิบายโค้ด:**
- `authKeys.all`: เป็น Root Key `["auth"]` สำหรับอ้างอิง Cache ทั้งหมดในหมวดหมู่การยืนยันตัวตน
- `authKeys.session()`: คืนค่า Tuple `["auth", "session"] as const` สำหรับใช้เป็น Key ประจำตัวของข้อมูล Session ปัจจุบัน

---

### 3.2 สร้าง Session Query Options (`src/client/caches/auth/queries/session.query.ts`)

สร้างไฟล์ `src/client/caches/auth/queries/session.query.ts` สำหรับดึงข้อมูล Session ปัจจุบันจาก `getSessionFn`:

```typescript
import { queryOptions } from "@tanstack/react-query";
import { getSessionFn } from "#/server-functions/auth/get-session.fn";
import { authKeys } from "../keys";

export function sessionQueryOptions() {
	return queryOptions({
		queryKey: authKeys.session(),
		queryFn: () => getSessionFn(),
		staleTime: 60_000,
	});
}
```

**คำอธิบายโค้ด:**
- ใช้ `queryOptions` จาก `@tanstack/react-query` ผูก `queryKey: authKeys.session()` เข้ากับ `queryFn: () => getSessionFn()`
- กำหนด `staleTime: 60_000` (60 วินาที) เพื่อให้ข้อมูล Session ที่โหลดมาแล้วถือว่ายังสดใหม่เป็นเวลา 1 นาที ช่วยให้ทั้ง `beforeLoad` ของ TanStack Router และ `useSession()` ใน UI อ่านค่าจาก Cache ได้ทันทีโดยไม่ต้องเรียก Server ซ้ำทุกครั้งที่เปลี่ยนหน้า

---

### 3.3 สร้าง Sign-In Mutation Hook (`src/client/caches/auth/mutates/sign-in.mutate.ts`)

สร้างไฟล์ `src/client/caches/auth/mutates/sign-in.mutate.ts` สำหรับส่งข้อมูลอีเมลและรหัสผ่านไปยืนยันตัวตนผ่าน `signInFn`:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signInFn } from "#/server-functions/auth/sign-in.fn";
import type { SignInInput } from "#/shared/schemas/auth.schema";
import { sessionQueryOptions } from "../queries/session.query";

export function useSignInMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: SignInInput) => signInFn({ data: input }),
		meta: {
			successToast: "เข้าสู่ระบบสำเร็จ",
		},
		onSuccess: async () => {
			await queryClient.query({
				...sessionQueryOptions(),
				staleTime: 0,
			});
		},
	});
}
```

**คำอธิบายโค้ด:**
- แยก `import type { SignInInput }` ออกจาก Runtime Import ตามกฎ `.agents/rules/globals.md` (ข้อ 3)
- `mutationFn`: รับ `input: SignInInput` แล้วส่งเข้า `signInFn({ data: input })`
- `meta.successToast`: กำหนดข้อความ `"เข้าสู่ระบบสำเร็จ"` เพื่อให้ Global `MutationCache` แสดง Toast เมื่อล็อกอินผ่าน
- `onSuccess`: สั่ง `await queryClient.query({ ...sessionQueryOptions(), staleTime: 0 })` เพื่อบังคับดึงข้อมูล Session ใหม่จาก Server ทันทีและรอจนกว่า Cache จะถูกอัปเดตเรียบร้อยก่อนจบ Lifecycle ของ Mutation

---

### 3.4 สร้าง Sign-Up Mutation Hook (`src/client/caches/auth/mutates/sign-up.mutate.ts`)

สร้างไฟล์ `src/client/caches/auth/mutates/sign-up.mutate.ts` สำหรับสร้างบัญชีผู้ใช้งานใหม่ผ่าน `signUpFn`:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signUpFn } from "#/server-functions/auth/sign-up.fn";
import type { SignUpInput } from "#/shared/schemas/auth.schema";
import { sessionQueryOptions } from "../queries/session.query";

export function useSignUpMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: SignUpInput) => signUpFn({ data: input }),
		meta: {
			successToast: "สร้างบัญชีผู้ใช้งานสำเร็จ",
		},
		onSuccess: async () => {
			await queryClient.query({
				...sessionQueryOptions(),
				staleTime: 0,
			});
		},
	});
}
```

**คำอธิบายโค้ด:**
- เนื่องจาก Backend (`SignUpUseCase` และ `signUpFn`) ทำการสร้างบัญชีผูก Role `member` และสร้าง Session Cookie ให้อัตโนมัติทันทีหลังสมัครเสร็จ ใน `onSuccess` เราจึงสั่ง `await queryClient.query({ ...sessionQueryOptions(), staleTime: 0 })` เหมือนกับตอน Sign-in เพื่อให้ผู้ใช้พร้อมเข้าสู่หน้า Workspace ได้ทันทีโดยไม่ต้องกรอกรหัสผ่านซ้ำอีกรอบ

---

### 3.5 สร้าง Sign-Out Mutation Hook (`src/client/caches/auth/mutates/sign-out.mutate.ts`)

สร้างไฟล์ `src/client/caches/auth/mutates/sign-out.mutate.ts` สำหรับออกจากระบบและล้างข้อมูลใน Cache:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOutFn } from "#/server-functions/auth/sign-out.fn";
import { authKeys } from "../keys";

export function useSignOutMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => signOutFn(),
		meta: {
			successToast: "ออกจากระบบแล้ว",
		},
		onSuccess: () => {
			queryClient.clear();
			queryClient.setQueryData(authKeys.session(), null);
		},
	});
}
```

**คำอธิบายโค้ด:**
- เมื่อ `signOutFn()` ลบ Session บน Server และเคลียร์ Cookie สำเร็จ ใน `onSuccess` จะรันคำสั่งสำคัญ 2 บรรทัด:
  1. `queryClient.clear()`: ล้างข้อมูล Cache ทุกตัวใน `QueryClient` เพื่อไม่ให้ข้อมูลของผู้ใช้คนเก่าค้างอยู่ในหน่วยความจำ
  2. `queryClient.setQueryData(authKeys.session(), null)`: กำหนดค่า Session ใน Cache ให้เป็น `null` ทันที เพื่อให้ทุก Component ที่ subscribe `authKeys.session()` อยู่ (เช่น `AuthHeaderControls`) เปลี่ยนสถานะเป็นไม่ได้ล็อกอินในทันที และไม่ให้ `beforeLoad` ของหน้า `/sign-in` เห็นข้อมูล Session เก่าค้างอยู่

---

### 3.6 สร้าง Verify Auth Check Mutation Hook (`src/client/caches/auth/mutates/verify-auth-check.mutate.ts`)

สร้างไฟล์ `src/client/caches/auth/mutates/verify-auth-check.mutate.ts` สำหรับทดสอบเรียก RPC `getAuthCheckFn` ที่มีการป้องกันด้วย `requireAuthMiddleware`:

```typescript
import { useMutation } from "@tanstack/react-query";
import { getAuthCheckFn } from "#/server-functions/auth/get-auth-check.fn";

export function useVerifyAuthCheckMutation() {
	return useMutation({
		mutationFn: () => getAuthCheckFn(),
		meta: {
			successToast: "ยืนยันตัวตนสำเร็จ",
		},
	});
}
```

**คำอธิบายโค้ด:**
- ใช้ `useMutation` เพื่อผูกกับปุ่มกดทดสอบการตรวจสอบสิทธิ์บนหน้า Workspace (`WorkspaceSessionCard`) เมื่อกดปุ่มจะยิง Request ไปยัง `getAuthCheckFn()` หากแนบ Session Cookie ถูกต้องจะได้รับข้อมูล `AuthCheckResultDto` กลับมาพร้อมแสดง Toast `"ยืนยันตัวตนสำเร็จ"`

---

## 4. การตรวจสอบความถูกต้องและ Git Commit (Verification & Commit)

ตรวจสอบความถูกต้องของ Type และ Format ด้วยคำสั่งของโปรเจกต์ (บังคับใช้ `bun` เท่านั้นตามกฎ `.agents/rules/globals.md` ข้อ 11):

```bash
bun run typecheck
bun run format
bun run check
```

เมื่อตรวจสอบแล้วว่าไม่มีข้อผิดพลาด ให้บันทึกการเปลี่ยนแปลงลง Git Repository ด้วย Commit Message ประจำ Step นี้:

```bash
git add src/client/caches/auth/
git commit -m "milestone-3.frontend.step-1: Client Caches Auth Queries & Mutations"
```
