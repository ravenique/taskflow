# TaskFlow — ระบบบริหารจัดการโครงการและงาน (Clean Architecture, DDD & Zero-Props Frontend)

**TaskFlow** คือระบบบริหารจัดการโครงการและงาน (Project & Task Management System) แบบ Full-Stack ที่ออกแบบและพัฒนาขึ้นเพื่อเป็นทั้ง **Production-Grade Application** และ **ต้นแบบการเรียนรู้สถาปัตยกรรมซอฟต์แวร์ (Reference Architecture & Learning Curriculum)** โดยยึดหลักการแยกขอบเขตความรับผิดชอบอย่างเคร่งครัด:

- **ฝั่ง Backend**: ใช้ **Clean Architecture + Tactical Domain-Driven Design (DDD)** ร่วมกับ **CQRS Read Projections** และ **Pure Manual Dependency Injection**
- **ฝั่ง Frontend**: ใช้ **Feature-Sliced Architecture** ภายใต้กฎเหล็ก **Zero Props Architecture** (ห้ามส่ง Props เข้า Feature Components ทุกตัวอ่าน State และ Action ผ่าน Single-Responsibility Hooks และ Compound Contexts เท่านั้น)
- **ฝั่ง Isomorphic Contract**: ใช้ **Shared Zod v4 Schemas** เป็น Single Source of Truth เดียวกันระหว่าง Server และ Client

---

## สารบัญ (Table of Contents)

1. [ฟีเจอร์หลักของระบบ (Key Features)](#1-ฟีเจอร์หลักของระบบ-key-features)
2. [เทคโนโลยีที่ใช้ (Tech Stack)](#2-เทคโนโลยีที่ใช้-tech-stack)
3. [สถาปัตยกรรมและทิศทางการพึ่งพา (Architecture & Dependency Flow)](#3-สถาปัตยกรรมและทิศทางการพึ่งพา-architecture--dependency-flow)
4. [โครงสร้างโฟลเดอร์ (Project Structure)](#4-โครงสร้างโฟลเดอร์-project-structure)
5. [การติดตั้งและเริ่มต้นใช้งาน (Getting Started)](#5-การติดตั้งและเริ่มต้นใช้งาน-getting-started)
6. [คำสั่งสคริปต์ทั้งหมด (Available Scripts)](#6-คำสั่งสคริปต์ทั้งหมด-available-scripts)
7. [การตรวจสอบกฎสถาปัตยกรรมอัตโนมัติ (Automated Architecture Audit)](#7-การตรวจสอบกฎสถาปัตยกรรมอัตโนมัติ-automated-architecture-audit)
8. [หลักสูตรการเรียนรู้แบบ Step-by-Step (`docs/learns/`)](#8-หลักสูตรการเรียนรู้แบบ-step-by-step-docslearns)

---

## 1. ฟีเจอร์หลักของระบบ (Key Features)

- **Authentication & SSR Session Guard (`Better Auth`)**:
  - ระบบลงชื่อเข้าใช้และสมัครสมาชิกด้วย Email & Password (`/sign-in`, `/sign-up`)
  - ผูกบทบาทเริ่มต้น (`standard_member`) ให้สมาชิกใหม่อัตโนมัติผ่าน Database Hook
  - ตรวจสอบสิทธิ์เข้าหน้าภายใน (`/_auth/**`) ตั้งแต่ระดับ SSR / Router `beforeLoad` พร้อม Hydrate สิทธิ์ของผู้ใช้ใน Single Round-Trip
- **Dynamic Hybrid RBAC (`role:permission`) แยกตาราง**:
  - ไม่ใช้ Role Enum ตายตัว แต่แยกตาราง `roles`, `permissions`, `role_permissions`, `user_roles` และ `project_members.role_id`
  - แยกขอบเขตสิทธิ์เป็น 2 ระดับอย่างชัดเจนด้วย Domain Invariant:
    - **สิทธิ์ระดับระบบ (`scope = 'system'`)**: เช่น `role:read`, `role:manage`, `user:read`, `user:assign_role`, `project:create`, `project:read_all`
    - **สิทธิ์ระดับโครงการ (`scope = 'project'`)**: เช่น `project:read`, `project:update`, `project:delete`, `project:manage_members`, `task:create`, `task:update`, `task:assign`, `task:delete`, `comment:create`, `comment:delete_any`
  - หน้าผู้ดูแลระบบสำหรับสร้าง/ลบ Custom Roles, แก้ไข Permission Matrix (`/admin/roles`) และมอบหมาย System Roles ให้ผู้ใช้งาน (`/admin/users`)
- **การบริหารจัดการโครงการและสมาชิกรายโครงการ (`Projects & Scoped Members`)**:
  - สร้างโครงการพร้อมรหัสย่อ (`ProjectKey` Value Object เช่น `TSK`, `OPS`) ภายใน ACID Transaction เดียว (สร้างโครงการ + ตั้งผู้สร้างเป็น `Project Owner` + บันทึก `ActivityLog`)
  - ตารางรายการโครงการแบบ **Server-Side TanStack Table** ที่ซิงก์ Search, Status Filter, Sorting และ Pagination เข้ากับ URL Search Params
  - จัดการสมาชิกรายโครงการ (`/projects/$projectId/members`) พร้อมกฎ **Last-Owner Invariant** ป้องกันการถอดหรือลดระดับ `Project Owner` คนสุดท้าย
- **การบริหารจัดการงานด้วย Finite State Machine (`Tasks FSM & Comments`)**:
  - ออกรหัสงานอัตโนมัติแบบเรียงลำดับตามโครงการ (`TSK-1`, `TSK-2`, ...) อย่างปลอดภัยต่อ Concurrency ด้วย Atomic SQL Sequence Update ใน Transaction
  - ควบคุมการเปลี่ยนสถานะงานด้วย **Finite State Machine (FSM)** ใน `TaskStatus` Value Object (`todo` $\rightarrow$ `in_progress` $\rightarrow$ `in_review` $\rightarrow$ `done` | `cancelled`)
  - ระบบแสดงความคิดเห็นในงาน (`TaskComment`) และไทม์ไลน์ประวัติกิจกรรม (`ActivityLog`)
- **แดชบอร์ดพื้นที่ทำงาน (`Workspace CQRS Dashboard`)**:
  - สรุปตัวเลข KPI (โครงการที่เปิดใช้งาน, โครงการที่จัดเก็บถาวร, งานค้างที่ได้รับมอบหมาย, งานที่เสร็จสมบูรณ์)
  - ตารางงานที่ได้รับมอบหมายข้ามโครงการแบบ Server-Side, รายการโครงการล่าสุด และฟีดกิจกรรมล่าสุดที่ดึงข้อมูลแบบ **Zero N+1 Queries**

---

## 2. เทคโนโลยีที่ใช้ (Tech Stack)

| เลเยอร์ | เทคโนโลยี | รายละเอียดการใช้งาน |
| :--- | :--- | :--- |
| **Runtime & Package Manager** | [Bun](https://bun.sh/) | ใช้เป็นทั้ง Package Manager (`bun install`) และ TypeScript Runtime (`bun run`) เพียงหนึ่งเดียว |
| **Full-Stack Framework** | [TanStack Start](https://tanstack.com/start) & [TanStack Router](https://tanstack.com/router) | File-Based Routing, SSR Integration, URL Search Validation (`validateSearch`) และ RPC Server Functions (`createServerFn`) |
| **UI & Styling** | React 19, [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (`base-vega`), [Lucide Icons](https://lucide.dev/) | ระบบ Design Tokens แบบ OKLCH รองรับ Light/Dark Theme เต็มรูปแบบ |
| **Server State & Caching** | [TanStack Query v5](https://tanstack.com/query) | รวมศูนย์ Queries, Mutations, Cache Invalidation และ Global `MutationCache` Toast ไว้ใน `src/client/caches/` |
| **Forms & Validation** | [TanStack Form v1](https://tanstack.com/form) & [Zod v4](https://zod.dev/) | ผูก Shared Zod Schema เข้ากับ Form Context (`createFormHook`) เพื่อรองรับ Zero-Props Form Components |
| **Data Tables** | [TanStack Table v9](https://tanstack.com/table) | ตารางข้อมูลแบบ Manual Server-Side Pagination, Sorting และ Faceted Filtering |
| **Database & ORM** | PostgreSQL (`pg`) & [Drizzle ORM](https://orm.drizzle.team/) (`drizzle-kit`) | จัดการ Schema, Migration, Relational/CQRS Queries และ Transaction Context ผ่าน `AsyncLocalStorage` |
| **Authentication** | [Better Auth](https://www.better-auth.com/) | ระบบยืนยันตัวตนเชื่อมต่อกับ Drizzle Adapter และ `tanstackStartCookies()` |
| **Linter & Formatter** | [Biome](https://biomejs.dev/) | ตรวจสอบคุณภาพโค้ด จัดเรียง Imports/Tailwind Classes และบังคับกฎ `noBarrelFile`, `noNamespaceImport`, `useImportType` |

---

## 3. สถาปัตยกรรมและทิศทางการพึ่งพา (Architecture & Dependency Flow)

ระบบแบ่งขอบเขตสถาปัตยกรรมออกเป็น 5 โซนหลักใน `src/` โดยมี `server-functions/` เป็นทางผ่านเดียว (Thin RPC Gateway) ระหว่างฝั่ง Client และฝั่ง Server:

```mermaid
flowchart TD
    subgraph ClientLayer ["Client & Routing Layer (Zero Props)"]
        ROUTE["src/routes/**\n(File Routes, beforeLoad, validateSearch, loader)"]
        SCREEN["src/client/features/**/screens/*.tsx\n(Screen Composition Roots)"]
        CTX["src/client/features/**/contexts/*.tsx\n(Feature Compound Contexts)"]
        COMP["src/client/features/**/components/*.tsx\n(Pure Zero-Props UI Components)"]
        HOOK["src/client/features/**/hooks/*.ts\n(Single-Responsibility Hooks)"]
        CACHE["src/client/caches/**\n(TanStack Query Keys, Queries, Mutations & Toast Meta)"]
        SHARED_UI["src/client/shared/**\n(AppShell, AppForm, AppDataTable, shadcn Primitives)"]

        ROUTE -->|renders| SCREEN
        ROUTE -->|preloads| CACHE
        SCREEN -->|provides| CTX
        SCREEN -->|composes| COMP
        COMP -->|reads state & actions| HOOK
        COMP -->|uses primitives| SHARED_UI
        HOOK -->|consumes| CTX
        HOOK -->|queries & mutates| CACHE
    end

    subgraph GatewayLayer ["RPC Transport Gateway"]
        SF["src/server-functions/**\n(1. DomainError MW -> 2. Auth/Perm MW -> 3. Zod Validator -> 4. Use Case)"]
    end

    subgraph ServerLayer ["Server Core (Clean Architecture + Tactical DDD)"]
        DI["src/server/composition/**\n(Pure Manual DI Containers & Repository Singletons)"]
        APP["src/server/application/**\n(Use Cases, CQRS Query Interfaces, Mappers, Authz Service)"]
        DOM["src/server/domain/**\n(Aggregate Roots, Entities, Value Objects, Repo Interfaces, Domain Errors)"]
        INFRA["src/server/infrastructure/**\n(Drizzle Repositories, CQRS Queries, Unit of Work, Better Auth Gateway)"]
        PG[("PostgreSQL Database")]

        DI -->|wires| APP
        DI -->|wires| INFRA
        APP -->|orchestrates| DOM
        INFRA -.->|implements contracts| DOM
        INFRA -.->|implements CQRS queries| APP
        INFRA -->|SQL / Transactions| PG
    end

    subgraph SharedContract ["Isomorphic Contract Layer"]
        ZOD["src/shared/schemas/**\n(Zod v4 Schemas & Inferred DTO Types)"]
    end

    CACHE ==>|invokes RPC| SF
    SF ==>|resolves Use Case| DI
    HOOK -.->|validates form| ZOD
    SF -.->|validates input/output| ZOD
    APP -.->|maps DTOs| ZOD
    DOM -.->|imports shared types/constants| ZOD
```

### กฎเหล็กทางสถาปัตยกรรม (Architectural Invariants)

1. **Pure Domain Layer (`src/server/domain/`)**: ห้ามนำเข้า Framework, Drizzle ORM, HTTP Status Code หรือโค้ดจากเลเยอร์ชั้นนอกโดยเด็ดขาด
2. **Implicit Transaction Propagation (`AsyncLocalStorage`)**: `IUnitOfWork.withTransaction(...)` จัดเก็บ Transaction (`tx`) ใน `AsyncLocalStorage` ทำให้ `DrizzleBaseRepository.executor` สลับใช้ `tx` อัตโนมัติโดยไม่ต้องส่ง `tx` ปนเปื้อนในพารามิเตอร์ของ Domain Repository Interface
3. **CQRS Separation**: งานเขียนข้อมูล (Command) ตรวจสอบ Invariants ผ่าน Aggregate Root เสมอ ส่วนงานอ่านตารางและแดชบอร์ดที่ซับซ้อน (Query) ใช้ Direct Query Projection (`IProjectQueries`, `ITaskQueries`, `IWorkspaceQueries`) เพื่อประสิทธิภาพสูงสุด
4. **Thin RPC Gateway (`src/server-functions/`)**: แยก 1 Endpoint ต่อ 1 ไฟล์ (`*.fn.ts`) ทำหน้าที่เฉพาะรัน Middleware (`domainErrorMiddleware`, `requireAuthMiddleware`, `requireSystemPermission`), ตรวจสอบ Input ด้วย Shared Zod Schema และส่งต่อให้ Use Case เท่านั้น
5. **Zero Props Frontend (`src/client/features/`)**: ห้ามประกาศหรือส่ง Props เข้า Feature Components (`features/**/components/*.tsx`) และบังคับ **1 ไฟล์ต่อ 1 Component**
6. **Centralized Mutation Feedback (`src/client/caches/global.ts`)**: ห้ามเรียก `toast` กระจายตามหน้าจอหรือ Component ให้ระบุผ่าน `meta: { successToast, errorToast }` ใน Mutation Hook เท่านั้น

---

## 4. โครงสร้างโฟลเดอร์ (Project Structure)

```text
taskflow/
├── .agents/
│   └── rules/                      # กฎสถาปัตยกรรมของโปรเจกต์ (architecture, globals, server, client)
├── docs/
│   └── learns/                     # บทเรียน Step-by-Step ทั้ง 78 ขั้นตอน (Milestones 1–8)
│       ├── development-roadmap.md  # แผนแม่บทและสารบัญบทเรียนทั้งหมด
│       └── milestone-*.md          # บทเรียนแยกตาม Milestone, ฝั่ง (Backend/Frontend) และ Boundary
├── drizzle/                        # ไฟล์ SQL Migration ที่สร้างโดย drizzle-kit
├── scripts/
│   └── audit-architecture.ts       # สคริปต์ตรวจสอบกฎสถาปัตยกรรมและ Design System อัตโนมัติ
├── src/
│   ├── shared/
│   │   └── schemas/                # Source of Truth ของ Zod Schemas และ DTO Types ข้ามฝั่ง Server/Client
│   ├── server/
│   │   ├── config/                 # ตรวจสอบ Environment Variables แบบ Fail-Fast (env.ts)
│   │   ├── domain/                 # Entities, Aggregate Roots, Value Objects, Domain Errors, Repo Interfaces
│   │   ├── application/            # Use Cases (1 ไฟล์ต่อ 1 Use Case), Data Mappers, CQRS Query Interfaces
│   │   ├── infrastructure/         # Drizzle Schema/DB/Seed, Repositories, CQRS Queries, Better Auth Gateway
│   │   └── composition/            # Pure Manual DI Containers (repositories.ts, *.container.ts)
│   ├── server-functions/
│   │   ├── middlewares/            # domain-error, auth และ permission middlewares
│   │   └── <module>/*.fn.ts        # Thin RPC Endpoints ประจำแต่ละโมดูล
│   ├── client/
│   │   ├── caches/                 # QueryClient กลาง, Query Keys, queryOptions และ Mutation Hooks
│   │   ├── core/                   # AppRootDocument, AppHeader, AppFooter, EntryPoint, NotFoundScreen
│   │   ├── shared/                 # AppShell, AppForm, AppDataTable, AppLink, Helpers และ Read-Only shadcn UI
│   │   ├── features/               # โมดูล UI แยกตามโดเมน (auth, rbac, users, projects, tasks, workspace)
│   │   └── styles/                 # Tailwind CSS v4 และ OKLCH Design Tokens (global.css)
│   ├── routes/                     # TanStack Router File-Based Routes (__root, api/auth/$, _public, _auth)
│   └── router.tsx                  # การตั้งค่า TanStack Router + SSR Query Integration
├── biome.json                      # การตั้งค่า Biome Linter & Formatter
├── components.json                 # การตั้งค่า shadcn/ui
├── drizzle.config.ts               # การตั้งค่า Drizzle Kit
├── package.json                    # รายการ Dependencies และ Scripts
├── tsconfig.json                   # การตั้งค่า TypeScript (Strict Mode + Path Alias #/*)
└── vite.config.ts                  # การตั้งค่า Vite + TanStack Start + Tailwind CSS v4
```

---

## 5. การติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### 5.1 สิ่งที่ต้องมีในเครื่อง (Prerequisites)

- **Bun** (เวอร์ชัน `1.2+`)
- **PostgreSQL** (เวอร์ชัน `15+` รันอยู่ในเครื่องหรือผ่าน Docker)

### 5.2 ขั้นตอนการติดตั้ง (Installation)

1. **ติดตั้ง Dependencies ด้วย Bun**:
   ```bash
   bun install
   ```

2. **ตั้งค่าไฟล์ Environment Variables (`.env`)**:
   คัดลอกไฟล์ `.env.example` เป็น `.env` แล้วปรับค่า `DATABASE_URL` และ `BETTER_AUTH_SECRET` ให้ตรงกับเครื่องของคุณ:
   ```bash
   cp .env.example .env
   ```
   ตัวอย่างค่าใน `.env`:
   ```env
   NODE_ENV="development"
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskflow"
   BETTER_AUTH_SECRET="replace-with-at-least-32-chars-random-hex-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

3. **สร้างตารางฐานข้อมูล (Run Database Migrations)**:
   *(ตรวจสอบให้แน่ใจว่าได้สร้างฐานข้อมูลชื่อ `taskflow` ใน PostgreSQL เรียบร้อยแล้ว)*
   ```bash
   bun run db:migrate
   ```

4. **เติมข้อมูลตั้งต้น (Seed Permissions, Default Roles & Super Admin)**:
   ```bash
   bun run db:seed
   ```
   คำสั่งนี้เป็นแบบ **Idempotent** (รันซ้ำได้อย่างปลอดภัย) โดยจะสร้าง:
   - รายการสิทธิ์ทั้งหมด 16 รายการ (`6 System Permissions` + `10 Project Permissions`)
   - บทบาทเริ่มต้น 6 บทบาท (`Super Admin`, `Standard Member`, `Project Owner`, `Project Manager`, `Contributor`, `Viewer`)
   - **บัญชีผู้ดูแลระบบสูงสุดเริ่มต้น (Super Admin)**:
     - **อีเมล**: `admin@taskflow.local`
     - **รหัสผ่าน**: `Password123!`

5. **รันเซิร์ฟเวอร์พัฒนา (Start Development Server)**:
   ```bash
   bun run dev
   ```
   เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

---

## 6. คำสั่งสคริปต์ทั้งหมด (Available Scripts)

| คำสั่ง | คำอธิบาย |
| :--- | :--- |
| `bun run dev` | รันระบบในโหมด Development ที่พอร์ต `3000` (`http://localhost:3000`) |
| `bun run build` | Build แอปพลิเคชันสำหรับใช้งานจริง (Production Build) |
| `bun run preview` | พรีวิว Production Build ในเครื่อง |
| `bun run generate-routes` | สร้างไฟล์ `src/routeTree.gen.ts` จากโครงสร้างไฟล์ใน `src/routes/` |
| `bun run typecheck` | ตรวจสอบความถูกต้องของ TypeScript ทั้งโปรเจกต์ (`tsc --noEmit`) |
| `bun run lint` | ตรวจสอบกฎ Linter ด้วย Biome (`biome lint .`) |
| `bun run check` | ตรวจสอบทั้ง Linter และ Formatter ด้วย Biome (`biome check .`) |
| `bun run format` | จัดรูปแบบโค้ดและเรียงลำดับ Imports อัตโนมัติ (`biome check --write .`) |
| `bun run audit` | รันสคริปต์ตรวจสอบกฎสถาปัตยกรรมและ Design System (`bun scripts/audit-architecture.ts`) |
| `bun run db:generate` | สร้างไฟล์ SQL Migration ใหม่จาก `src/server/infrastructure/drizzle/schema.ts` |
| `bun run db:migrate` | รัน SQL Migration ลงฐานข้อมูล PostgreSQL |
| `bun run db:seed` | เติมข้อมูล Permissions, Roles และบัญชี Super Admin ตั้งต้นลงฐานข้อมูล |
| `bun run db:studio` | เปิด Drizzle Studio เพื่อสำรวจข้อมูลในฐานข้อมูลผ่านเว็บ UI |

---

## 7. การตรวจสอบกฎสถาปัตยกรรมอัตโนมัติ (Automated Architecture Audit)

โปรเจกต์นี้มาพร้อมกับ **Architectural Fitness Function** ในไฟล์ [scripts/audit-architecture.ts](file:///d:/ravenique/sandbox/taskflow/scripts/audit-architecture.ts) ซึ่งทำหน้าที่สแกนซอร์สโค้ดทั้งหมดใน `src/` เพื่อตรวจจับการละเมิดกฎใน `.agents/rules/` โดยอัตโนมัติ เช่น:

- ห้ามมี Barrel Files (`index.ts` ที่ทำหน้าที่เพียง re-export นอก `routes/`)
- ห้าม `server/domain/` นำเข้าไลบรารีภายนอกหรือเลเยอร์ชั้นนอก (อนุญาตเฉพาะ `#/server/domain/` และ `#/shared/schemas/`)
- ห้าม `server/application/` นำเข้า `drizzle-orm` หรือ `#/server/infrastructure/` โดยตรง
- ห้าม `routes/` นำเข้า `#/server/` หรือประกอบ `features/**/components/` โดยตรง
- ห้าม `client/features/` เรียก `#/server-functions/` โดยตรง (ต้องผ่าน `client/caches/` เท่านั้น)
- ห้ามเรียก `toast.` นอก `client/caches/`
- บังคับกฎ **Zero Props** ใน `client/features/**/components/*.tsx` และกฎ **1 Component ต่อ 1 ไฟล์**
- ห้ามใช้ Deep Relative Imports (`../../`), Wildcard Imports (`import * as`), `any`, `@ts-ignore`, การเข้าถึง `process.env` นอก `env.ts`, การเขียน `border-*` / `ring-*` ดิบใน UI หรือการใช้ Emoji ใน UI

รันตรวจสอบได้ด้วยคำสั่ง:

```bash
bun run audit
```

---

## 8. หลักสูตรการเรียนรู้แบบ Step-by-Step (`docs/learns/`)

หากคุณต้องการศึกษาวิธีสร้างโปรเจกต์นี้ตั้งแต่เริ่มต้น (`Blank Repo`) ไปจนครบทุกฟีเจอร์ทีละขั้นตอน สามารถเริ่มต้นได้ที่เอกสารแผนแม่บท:

- **[แผนแม่บทการเรียนรู้และพัฒนา (Development Roadmap)](./docs/learns/development-roadmap.md)**

ภายในแบ่งออกเป็น **8 Milestones (รวม 78 บทเรียนย่อย)** โดยแยกตามขอบเขต **Backend** และ **Frontend** อย่างเป็นระบบ:

| Milestone | หัวข้อการเรียนรู้หลัก | จำนวน Step |
| :--- | :--- | :---: |
| **Milestone 1** | การเริ่มต้นโปรเจกต์ เครื่องมือ กฎสถาปัตยกรรม และ Core Architecture Shell | 9 Steps (4 Backend / 5 Frontend) |
| **Milestone 2** | ฐานข้อมูล PostgreSQL, Drizzle ORM, AsyncLocalStorage Unit of Work และ Seed | 4 Steps (4 Backend) |
| **Milestone 3** | ระบบยืนยันตัวตนด้วย Better Auth, Port & Adapter Gateway และ Guarded Routes | 10 Steps (5 Backend / 5 Frontend) |
| **Milestone 4** | ระบบจัดการสิทธิ์แบบไดนามิก (`role:permission`) และหน้าผู้ดูแลระบบ (`/admin/*`) | 11 Steps (6 Backend / 5 Frontend) |
| **Milestone 5** | โมดูลจัดการโครงการ (`Project` Aggregate) และตาราง Server-Side ที่ซิงก์กับ URL | 11 Steps (6 Backend / 5 Frontend) |
| **Milestone 6** | รายละเอียดโครงการ การจัดการสมาชิกรายโครงการ (`Last-Owner Invariant`) และประวัติกิจกรรม | 12 Steps (6 Backend / 6 Frontend) |
| **Milestone 7** | โมดูลจัดการงาน (`TaskStatus` Finite State Machine), ความคิดเห็น และหน้ารายละเอียดงาน | 12 Steps (6 Backend / 6 Frontend) |
| **Milestone 8** | แดชบอร์ดพื้นที่ทำงานด้วย CQRS Read Projections และการตรวจสอบสถาปัตยกรรมอัตโนมัติ | 9 Steps (5 Backend / 4 Frontend) |
