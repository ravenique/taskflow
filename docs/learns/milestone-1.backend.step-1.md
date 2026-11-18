# Milestone 1 — Backend Step 1: Project Initialization, Tooling & Architectural Rules

## 1. เป้าหมายและขอบเขต Boundary (Boundary Context & Goal)

ในขั้นตอนแรกของโปรเจกต์ **TaskFlow** เราจะเริ่มต้นจากการสร้างโปรเจกต์ด้วย **TanStack Start** บนรันไทม์ **Bun** พร้อมตั้งค่าเครื่องมือพื้นฐานระดับวิศวกรรมซอฟต์แวร์ (TypeScript, Vite, Biome, Tailwind CSS v4, shadcn/ui, Drizzle ORM และ Better Auth) รวมถึงการวางโครงสร้างโฟลเดอร์และกฎสถาปัตยกรรม (`.agents/rules/`) เพื่อบังคับใช้ขอบเขตของ **Clean Architecture**, **Domain-Driven Design (DDD)** และ **Zero Props Frontend** ตั้งแต่วินาทีแรกของโปรเจกต์

### ตารางสรุปไฟล์ใน Step นี้

| ลำดับ | เส้นทางไฟล์ (Path) | หน้าที่ความรับผิดชอบ (Responsibility) |
| :--- | :--- | :--- |
| 1 | `package.json` | กำหนด Dependencies, Scripts และบังคับใช้ `bun` เป็น Package Manager & Runtime เดียวของโปรเจกต์ |
| 2 | `tsconfig.json` | ตั้งค่า TypeScript Compiler แบบ Strict Mode, Bundler Resolution และ Path Alias (`#/*` ชี้ไปที่ `./src/*`) |
| 3 | `tsr.config.json` | ตั้งค่า TanStack Router CLI ให้สร้าง Route Tree สำหรับ React |
| 4 | `vite.config.ts` | ตั้งค่า Vite Build Pipeline ผสาน `tsconfigPaths`, DevTools, Tailwind CSS v4, TanStack Start และ React |
| 5 | `biome.json` | ตั้งค่า Linter & Formatter ระดับโปรเจกต์เพื่อบังคับใช้กฎ Code Quality และ Architectural Guardrails อัตโนมัติ |
| 6 | `components.json` | ตั้งค่า shadcn/ui CLI ให้ติดตั้ง Primitive Components ลงใน Read-Only Layer (`#/client/shared/shadcn/*`) |
| 7 | `.env.example` | แม่แบบตัวแปรสภาพแวดล้อม (Environment Variables) สำหรับ PostgreSQL และ Better Auth |
| 8 | `.gitignore` | กำหนดรายการไฟล์และโฟลเดอร์ที่ไม่ต้องนำเข้าสู่ระบบ Git Version Control |

### แผนภาพสถาปัตยกรรมและทิศทางการพึ่งพา (Architecture & Dependency Flow)

```mermaid
flowchart TD
    subgraph RootConfig["Root Configuration & Tooling"]
        PKG["package.json (Bun Runtime)"]
        TS["tsconfig.json (#/* Alias)"]
        VITE["vite.config.ts (Vite + TanStack Start)"]
        BIOME["biome.json (Static Guardrails)"]
    end

    subgraph AppBoundaries["Application Architectural Boundaries (src/)"]
        ROUTES["src/routes/ (TanStack Router)"]
        CLIENT["src/client/ (Zero Props Frontend & Caches)"]
        SF["src/server-functions/ (Thin RPC Gateway)"]
        SERVER["src/server/ (DDD & Clean Architecture)"]
        SHARED["src/shared/ (Isomorphic Zod Contracts)"]
    end

    RootConfig --> AppBoundaries
    ROUTES -->|renders & preloads| CLIENT
    CLIENT -->|invokes RPC| SF
    SF -->|dispatches Use Case| SERVER
    CLIENT -->|validates & types| SHARED
    SF -->|validates input/output| SHARED
    SERVER -->|consumes contracts| SHARED
```

---

## 2. ทฤษฎี ความสำคัญ และกฎสถาปัตยกรรมเฉพาะ Boundary นี้

การวางโครงสร้างโปรเจกต์ที่ดีตั้งแต่เริ่มต้นช่วยป้องกันปัญหา **Architectural Erosion** (สถาปัตยกรรมเสื่อมสภาพเมื่อโค้ดเติบโตขึ้น) โดยในโปรเจกต์นี้เรากำหนดกฎเหล็กใน `.agents/rules/` แบ่งออกเป็น 4 เสาหลัก ดังนี้:

### 2.1 กฎระดับ Global (`globals.md`)
1. **Bun Runtime Invariant (ข้อ 11)**: บังคับใช้ `bun` เป็น Package Manager และ Runtime เพียงตัวเดียวเท่านั้น (`bun install`, `bun run`, `bun x`) ห้ามใช้ `npm`, `pnpm`, `yarn` หรือ `node` เพื่อป้องกันความเสียหายต่อ `bun.lock` และ `node_modules`
2. **Path Alias & Shallow Relative Imports (ข้อ 2)**: อนุญาตให้ใช้ Relative Import ได้เฉพาะ `./` และ `../` เท่านั้น หากข้ามโฟลเดอร์ลึกกว่านั้นต้องใช้ Path Alias `#/` เสมอ (กำหนดไว้ใน `tsconfig.json` และเปิดใช้งานผ่าน `resolve: { tsconfigPaths: true }` ใน `vite.config.ts`)
3. **Explicit Type Imports & No Barrel Files (ข้อ 3, 4, 5)**:
   - ต้องแยก `import type { ... }` ออกจาก Runtime Import อย่างชัดเจน (บังคับผ่านกฎ `useImportType` ใน `biome.json`)
   - ห้ามใช้ Namespace/Wildcard Import (`import * as ...`) และห้ามสร้าง Barrel File (`index.ts` ที่ทำหน้าที่เพียง re-export) เพื่อป้องกัน Circular Dependency (บังคับผ่านกฎ `noBarrelFile` และ `noNamespaceImport` ใน `biome.json`)
4. **Shared Schemas as Single Source of Truth**: ข้อมูลที่ข้ามขอบเขตระหว่าง Client และ Server ต้องนิยามด้วย Zod Schema ใน `src/shared/schemas/**` เสมอ และใช้ `z.infer<typeof Schema>` ในการสร้าง Type

### 2.2 กฎขอบเขตสถาปัตยกรรม (`architecture.md`)
แบ่งโครงสร้างภายใน `src/` ออกเป็น 5 โซนที่มีหน้าที่ชัดเจน:
- `src/shared/`: Isomorphic Layer เก็บ Zod Schemas และ DTOs ที่ใช้ร่วมกันทั้งฝั่ง Server และ Client โดยไม่มี Framework Side-effects
- `src/server/`: Backend Core ออกแบบตามหลัก **Clean Architecture & Tactical DDD** แบ่งย่อยเป็น `config/`, `domain/`, `application/`, `infrastructure/` และ `composition/`
- `src/server-functions/`: **Thin Driving Adapter (RPC Gateway)** ของ TanStack Start เป็นทางผ่านเดียวระหว่าง Client กับ `src/server/`
- `src/client/`: Frontend Layer แบ่งเป็น `caches/` (TanStack Query), `core/` (App Shell & Providers), `features/` (Zero Props UI & Single-Responsibility Hooks), `shared/` (Wrappers & Read-only shadcn primitives) และ `styles/` (Tailwind CSS v4)
- `src/routes/`: TanStack Router File-based Routing รับผิดชอบเฉพาะ URL Mapping, Route Guard (`beforeLoad`), Data Preloading (`loader`) และการเรียก Screen Component มาแสดงผล

### 2.3 กฎฝั่ง Server (`server.md`)
- **Inward Dependency Rule (ข้อ 1)**: ทิศทางการพึ่งพาต้องไหลเข้าหาศูนย์กลางเสมอ (`Infrastructure -> Application -> Domain`) โดย `src/server/domain/` ห้าม import สิ่งใดจากเลเยอร์ชั้นนอกเด็ดขาด ยกเว้น `src/shared/schemas/`
- **Tactical DDD & Pure Persistence Separation (ข้อ 4–16)**: แยก Domain Entity/Aggregate Root ออกจาก Drizzle Database Schema อย่างเด็ดขาด มีการใช้ `IUnitOfWork` ควบคู่กับ `AsyncLocalStorage` เพื่อจัดการ Transaction โดยไม่ให้ Database Driver รั่วไหลเข้าสู่ Domain Interface
- **Pure Manual DI (ข้อ 17)**: รวมศูนย์การประกอบ Object Graph (Repositories + Use Cases) ไว้ที่ `src/server/composition/` โดยไม่พึ่งพา DI Framework ที่ซับซ้อน

### 2.4 กฎฝั่ง Client (`client.md`)
- **Zero Props Architecture (ข้อ 1–5)**: Feature Components (`src/client/features/**/components/*.tsx`) และ Screens (`src/client/features/**/screens/*.tsx`) ต้องเป็น Pure Presentation ที่ไม่รับ Props ใดๆ (Zero Props) และห้ามมี Business/State Logic อยู่ภายใน โดยให้ดึงสถานะและฟังก์ชันการทำงานจาก Single-Responsibility Hooks (`src/client/features/**/hooks/*.ts`) เท่านั้น
- **Centralized Server-State & Toast Feedback (ข้อ 8–9)**: การเรียกใช้ `server-functions` และการแสดง Toast Feedback ของการเปลี่ยนแปลงข้อมูล (Mutation) ต้องรวมศูนย์อยู่ที่ `src/client/caches/**` เท่านั้น
- **Read-Only shadcn Primitives (ข้อ 14)**: โฟลเดอร์ `src/client/shared/shadcn/**` ที่กำหนดไว้ใน `components.json` ถือเป็น Read-Only Layer ห้ามดัดแปลงแก้ไขโดยตรง และตั้งค่าให้ `biome.json` ยกเว้นการตรวจสอบโฟลเดอร์นี้ (`!!src/client/shared/shadcn`)

---

## 3. ลงมือเขียนโค้ด (Step-by-Step Implementation)

### 3.1 การเริ่มต้นโปรเจกต์และติดตั้ง Dependencies ด้วย Bun

หากคุณเริ่มต้นจากโฟลเดอร์ว่าง ให้สร้างโปรเจกต์และติดตั้งแพ็กเกจทั้งหมดด้วยคำสั่งต่อไปนี้:

```bash
# 1. สร้างโปรเจกต์ TanStack Start (หรือสร้างโฟลเดอร์ taskflow แล้วรันด้วย bun)
bun create @tanstack/start@latest taskflow
cd taskflow

# 2. ติดตั้ง Production Dependencies
bun add @base-ui/react @better-auth/drizzle-adapter @fontsource-variable/google-sans @fontsource-variable/outfit @tailwindcss/vite @tanstack/react-devtools @tanstack/react-form @tanstack/react-query @tanstack/react-router @tanstack/react-router-devtools @tanstack/react-router-ssr-query @tanstack/react-start @tanstack/react-table better-auth class-variance-authority cn drizzle-orm lucide-react pg react react-dom shadcn tailwindcss tw-animate-css zod

# 3. ติดตั้ง Development Dependencies
bun add -d @biomejs/biome @tanstack/devtools-vite @tanstack/router-cli @types/node @types/pg @types/react @types/react-dom @vitejs/plugin-react drizzle-kit typescript vite
```

จากนั้นให้สร้างโฟลเดอร์ตามโครงสร้างสถาปัตยกรรมของระบบ:

```bash
mkdir -p src/shared/schemas
mkdir -p src/server/config src/server/domain/common src/server/application/mappers src/server/infrastructure/drizzle src/server/composition
mkdir -p src/server-functions/middlewares
mkdir -p src/client/caches src/client/core src/client/features src/client/shared/components src/client/shared/shadcn src/client/styles
mkdir -p src/routes
```

---

### 3.2 ไฟล์ `package.json`

ปรับปรุงไฟล์ `package.json` ที่ระดับ Root ของโปรเจกต์ให้ตรงตามรายการ Scripts และเวอร์ชันของแพ็กเกจทั้งหมด:

```json
{
	"name": "taskflow",
	"private": true,
	"type": "module",
	"scripts": {
		"preinstall": "bun x only-allow bun",
		"dev": "vite dev --port 3000",
		"generate-routes": "bun node_modules/@tanstack/router-cli/dist/esm/index.js generate",
		"build": "vite build",
		"preview": "vite preview",
		"lint": "biome lint .",
		"format": "biome check --write .",
		"check": "biome check .",
		"typecheck": "tsc --noEmit",
		"audit": "bun scripts/audit-architecture.ts",
		"db:generate": "drizzle-kit generate",
		"db:migrate": "drizzle-kit migrate",
		"db:studio": "drizzle-kit studio",
		"db:seed": "bun src/server/infrastructure/drizzle/seed.ts"
	},
	"dependencies": {
		"@base-ui/react": "^1.9.0",
		"@better-auth/drizzle-adapter": "^1.7.25",
		"@fontsource-variable/google-sans": "^5.3.2",
		"@fontsource-variable/outfit": "^5.3.0",
		"@tailwindcss/vite": "^4",
		"@tanstack/react-devtools": "latest",
		"@tanstack/react-form": "^1.33.5",
		"@tanstack/react-query": "^5.105.3",
		"@tanstack/react-router": "latest",
		"@tanstack/react-router-devtools": "latest",
		"@tanstack/react-router-ssr-query": "^1.167.3",
		"@tanstack/react-start": "latest",
		"@tanstack/react-table": "^9.3.1",
		"better-auth": "^1.7.25",
		"class-variance-authority": "^0.7.1",
		"cn": "^0.4.0",
		"drizzle-orm": "^0.45.4",
		"lucide-react": "^1.59.0",
		"pg": "^8.23.1",
		"react": "^19.3.0",
		"react-dom": "^19.3.0",
		"shadcn": "^4.22.0",
		"tailwindcss": "^4",
		"tw-animate-css": "^1.4.0",
		"zod": "^4.6.7"
	},
	"devDependencies": {
		"@biomejs/biome": "2.6.7",
		"@tanstack/devtools-vite": "latest",
		"@tanstack/router-cli": "^1.167.39",
		"@types/node": "^22",
		"@types/pg": "^8.23.1",
		"@types/react": "^19",
		"@types/react-dom": "^19",
		"@vitejs/plugin-react": "^6",
		"drizzle-kit": "^0.31.11",
		"typescript": "^6.0.2",
		"vite": "^8"
	}
}
```

**คำอธิบายโค้ด:**
- `"preinstall": "bun x only-allow bun"`: บังคับให้การติดตั้งแพ็กเกจสามารถทำผ่าน `bun` เท่านั้น ตามกฎ `globals.md` ข้อ 11
- `"generate-routes"`: ใช้สร้างไฟล์ `src/routeTree.gen.ts` จากโครงสร้างไฟล์ใน `src/routes/`
- `"check"` และ `"typecheck"`: คำสั่งตรวจสอบมาตรฐานโค้ดด้วย Biome และตรวจสอบความถูกต้องของชนิดข้อมูลด้วย TypeScript Compiler (`tsc --noEmit`)

---

### 3.3 ไฟล์ `tsconfig.json`

สร้างหรือแก้ไขไฟล์ `tsconfig.json` ที่ระดับ Root:

```json
{
	"include": ["**/*.ts", "**/*.tsx", "vite.config.ts"],
	"compilerOptions": {
		"target": "ES2022",
		"jsx": "react-jsx",
		"module": "ESNext",
		"lib": ["ES2022", "DOM", "DOM.Iterable"],
		"types": ["vite/client"],
		"paths": {
			"#/*": ["./src/*"]
		},

		/* Bundler mode */
		"moduleResolution": "bundler",
		"allowImportingTsExtensions": true,
		"verbatimModuleSyntax": true,
		"noEmit": true,

		/* Linting */
		"skipLibCheck": true,
		"strict": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"noFallthroughCasesInSwitch": true,
		"noUncheckedSideEffectImports": true,
		"noImplicitAny": true
	}
}
```

**คำอธิบายโค้ด:**
- `"paths": { "#/*": ["./src/*"] }`: กำหนด Path Alias `#/` ให้ชี้ไปยัง `./src/` เพื่อให้ทุกเลเยอร์สามารถอ้างอิงข้ามโมดูลได้โดยไม่ต้องใช้ Deep Relative Import (`../../`)
- `"verbatimModuleSyntax": true`: บังคับให้การนำเข้า Type ต้องระบุ `import type` อย่างชัดเจน เพื่อป้องกันไม่ให้ Type-only Import หลุดเข้าไปใน JavaScript Bundle ตอนรันไทม์
- `"strict": true` ร่วมกับ `"noImplicitAny": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`: ยกระดับความปลอดภัยทางชนิดข้อมูลสูงสุดตามกฎ `globals.md` ข้อ 8

---

### 3.4 ไฟล์ `tsr.config.json`

สร้างไฟล์ `tsr.config.json` ที่ระดับ Root สำหรับกำหนดเป้าหมายของ TanStack Router Generator:

```json
{
	"target": "react"
}
```

---

### 3.5 ไฟล์ `vite.config.ts`

สร้างไฟล์ `vite.config.ts` ที่ระดับ Root เพื่อเชื่อมโยงปลั๊กอินทั้งหมดเข้ากับ Vite:

```typescript
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
});

export default config;
```

**คำอธิบายโค้ด:**
- `resolve: { tsconfigPaths: true }`: เปิดใช้งานการแปลง Path Alias (`#/*`) จาก `tsconfig.json` ในระดับ Vite Bundler โดยตรง
- `plugins`: เรียงลำดับการทำงานตั้งแต่ TanStack DevTools, Tailwind CSS v4 Vite Plugin, TanStack Start SSR/RPC Plugin และ Vite React Plugin

---

### 3.6 ไฟล์ `biome.json`

สร้างไฟล์ `biome.json` ที่ระดับ Root เพื่อตั้งค่า Linter และ Formatter:

```json
{
	"$schema": "https://biomejs.dev/schemas/2.6.7/schema.json",
	"vcs": {
		"enabled": true,
		"clientKind": "git",
		"useIgnoreFile": true
	},
	"files": {
		"includes": [
			"**",
			"!!.agents",
			"!!.tanstack",
			"!!dist",
			"!!dist-ssr",
			"!!docs",
			"!!drizzle",
			"!!public",
			"!!skills-lock.json",
			"!!src/client/shared/shadcn",
			"!!src/routeTree.gen.ts"
		]
	},
	"formatter": {
		"enabled": true
	},
	"markdown": {
		"formatter": {
			"enabled": false
		}
	},
	"assist": {
		"enabled": true,
		"actions": {
			"source": {
				"organizeImports": "on"
			}
		}
	},
	"css": {
		"parser": {
			"tailwindDirectives": true
		}
	},
	"tailwind": {
		"stylesheet": "src/client/styles/global.css",
		"mergeFunctions": ["cn"],
		"variantFunctions": ["cva"]
	},
	"linter": {
		"enabled": true,
		"domains": {
			"react": "recommended",
			"tanstackQuery": "all"
		},
		"rules": {
			"complexity": {
				"noStaticOnlyClass": "off"
			},
			"preset": "recommended",
			"correctness": {
				"noUnusedImports": "error"
			},
			"performance": {
				"noBarrelFile": "error",
				"noNamespaceImport": "error"
			},
			"style": {
				"useImportType": {
					"level": "error",
					"options": {
						"style": "separatedType"
					}
				},
				"useImportsFirst": "error",
				"useNodejsImportProtocol": "error"
			},
			"nursery": {
				"useTailwindSortedClasses": {
					"level": "error",
					"fix": "safe"
				}
			}
		}
	}
}
```

**คำอธิบายโค้ด:**
- `"noStaticOnlyClass": "off"`: ปิดกฎห้ามใช้คลาสที่มีเฉพาะ Static Method เพื่ออนุญาตให้เราสร้าง Mapper Class ตามกฎ `server.md` ข้อ 11 (เช่น `UserMapper.toDto(user)`)
- `"noBarrelFile": "error"` และ `"noNamespaceImport": "error"`: บังคับใช้กฎ `globals.md` ข้อ 4 และ 5 อัตโนมัติ
- `"useImportType"` (`"separatedType"`): บังคับใช้กฎ `globals.md` ข้อ 3 ให้แยก `import type` ออกเป็นบรรทัดต่างหากเสมอ
- `"!!src/client/shared/shadcn"` และ `"!!src/routeTree.gen.ts"`: ยกเว้นไฟล์ที่สร้างขึ้นอัตโนมัติและ Read-Only Primitives ไม่ให้ถูก Formatter/Linter แก้ไข

---

### 3.7 ไฟล์ `components.json`

สร้างไฟล์ `components.json` ที่ระดับ Root สำหรับกำหนดโครงสร้างของ shadcn/ui:

```json
{
	"$schema": "https://ui.shadcn.com/schema.json",
	"style": "base-vega",
	"rsc": false,
	"tsx": true,
	"tailwind": {
		"config": "",
		"css": "src/client/styles/global.css",
		"baseColor": "neutral",
		"cssVariables": true,
		"prefix": ""
	},
	"iconLibrary": "lucide",
	"rtl": false,
	"aliases": {
		"components": "#/client/shared/shadcn/components",
		"utils": "#/client/shared/shadcn/lib/utils",
		"ui": "#/client/shared/shadcn/components/ui",
		"lib": "#/client/shared/shadcn/lib",
		"hooks": "#/client/shared/shadcn/hooks"
	},
	"menuColor": "default",
	"menuAccent": "subtle",
	"registries": {}
}
```

**คำอธิบายโค้ด:**
- `"style": "base-vega"`: ใช้ชุดคอมโพเนนต์พื้นฐานที่ขับเคลื่อนด้วย `@base-ui/react`
- `"aliases"`: บังคับให้ทุกคอมโพเนนต์ที่ติดตั้งผ่าน shadcn CLI ถูกจัดเก็บไว้ภายใต้ `#/client/shared/shadcn/*` ซึ่งเป็น Read-Only Layer ตามกฎ `client.md` ข้อ 14

---

### 3.8 ไฟล์ `.env.example` และ `.gitignore`

สร้างไฟล์ `.env.example` ที่ระดับ Root:

```env
# Runtime Environment ("development" | "test" | "production")
NODE_ENV="development"

# Local PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskflow"

# Better Auth Secret (minimum 32 characters)
BETTER_AUTH_SECRET="replace-with-at-least-32-chars-random-hex-secret"

# Better Auth Base URL
BETTER_AUTH_URL="http://localhost:3000"
```

> [!IMPORTANT]
> หลังจากสร้างไฟล์ `.env.example` แล้ว ให้คัดลอกไฟล์นี้ไปเป็นไฟล์ `.env` สำหรับใช้งานในเครื่องของคุณด้วยคำสั่ง:
> ```bash
> cp .env.example .env
> ```

ต่อมา สร้างไฟล์ `.gitignore` ที่ระดับ Root เพื่อป้องกันไม่ให้ไฟล์ `.env` และไฟล์ผลลัพธ์จากการ Build ถูกส่งขึ้น Git Repository:

```gitignore
node_modules
.DS_Store
dist
dist-ssr
*.local
.env*
!.env.example
.nitro
.tanstack
.wrangler
.output
.vinxi
__unconfig*
todos.json

# typescript
*.tsbuildinfo
```

---

## 4. การตรวจสอบความถูกต้องและ Git Commit (Verification & Commit)

เมื่อสร้างไฟล์ตั้งค่าพื้นฐานครบถ้วนแล้ว ให้ทดสอบติดตั้งแพ็กเกจและตรวจสอบการทำงานของ Biome ด้วยคำสั่งต่อไปนี้:

```bash
# 1. ตรวจสอบการติดตั้ง Dependencies ด้วย Bun
bun install

# 2. ตรวจสอบความถูกต้องของไฟล์ JSON/TS Config ด้วย Biome
bun run check
```

หากทุกอย่างผ่านเรียบร้อยโดยไม่มีข้อผิดพลาด ให้บันทึกการเปลี่ยนแปลงเข้าสู่ Git Repository:

```bash
git add package.json tsconfig.json tsr.config.json vite.config.ts biome.json components.json .env.example .gitignore
git commit -m "milestone-1.backend.step-1: Project Initialization, Tooling & Architectural Rules"
```
