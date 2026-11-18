# Milestone 5 — Frontend Step 2: Feature Projects Context & Hooks (src/client/features/projects/)

ในขั้นตอนนี้ เราจะสร้าง **Context และ Single-Responsibility Hooks** สำหรับฟีเจอร์ Projects เพื่อเป็นเจ้าของ State และ Logic ทั้งหมดของหน้ารายการโครงการ ภายใต้หลักการ **Zero Props Architecture** โดยแยกความรับผิดชอบออกเป็นส่วนๆ อย่างชัดเจน ได้แก่ การกระจายสถานะเปิด/ปิด Dialog ผ่าน `ProjectsContext`, การซิงก์สถานะตารางเข้ากับ URL Search Params (`useProjectsSearch`), การควบคุม Server-Side Table (`useProjectsTable`), การจัดการแถบเครื่องมือค้นหาพร้อม Debounce (`useProjectsToolbar`) และการจัดการฟอร์ม/กล่องยืนยัน (`useCreateProjectForm`, `useEditProjectForm`, `useArchiveProjectDialog`)

---

## 1. เป้าหมายและขอบเขต Boundary (Boundary Context & Goal)

ตามสถาปัตยกรรม Frontend ของระบบ (`src/client/features/projects/`) Presentation Components ทุกตัวต้องเป็น **Pure Declarative UI แบบ Zero Props** ดังนั้นการจัดการ State, การดึงข้อมูลผ่าน Cache, การแปลงค่า Pagination/Sorting และการส่งข้อมูลผ่าน Form/Mutation ทั้งหมดจะต้องถูกห่อหุ้ม (Encapsulate) อยู่ใน `contexts/` และ `hooks/` ของฟีเจอร์นี้เท่านั้น

### ตารางสรุปไฟล์ใน Step นี้

| ลำดับ | เส้นทางไฟล์ (File Path) | หน้าที่ความรับผิดชอบ (Responsibility) |
| :--- | :--- | :--- |
| 1 | `src/client/features/projects/contexts/projects.context.tsx` | Compound Context จัดการสถานะการเปิด/ปิด Dialog สร้างโครงการ, แก้ไขโครงการ และเก็บถาวร/กู้คืนโครงการโดยไม่ต้องส่ง Props ข้าม Component |
| 2 | `src/client/features/projects/hooks/use-projects-search.ts` | อ่านและอัปเดต URL Search Params ของหน้า `/projects` โดยตรวจสอบความถูกต้องผ่าน `projectsSearchSchema` |
| 3 | `src/client/features/projects/hooks/use-projects-table.ts` | ผสาน TanStack Query (`keepPreviousData`) เข้ากับ TanStack Table แบบ Server-Side (`manualPagination`, `manualSorting`) |
| 4 | `src/client/features/projects/hooks/use-projects-toolbar.ts` | จัดการช่องค้นหาแบบ Debounce (300ms), ตัวกรองสถานะ (`all` / `active` / `archived`) และตรวจสอบสิทธิ์ `project:create` |
| 5 | `src/client/features/projects/hooks/use-create-project-form.ts` | จัดการฟอร์มสร้างโครงการใหม่ด้วย `useAppForm` และ `createProjectInputSchema` |
| 6 | `src/client/features/projects/hooks/use-edit-project-form.ts` | จัดการฟอร์มแก้ไขชื่อและคำอธิบายโครงการ พร้อมซิงก์ค่าเริ่มต้นเมื่อ `editingProject` เปลี่ยนแปลง |
| 7 | `src/client/features/projects/hooks/use-archive-project-dialog.ts` | จัดการการยืนยันเก็บถาวร (`archive`) หรือกู้คืน (`restore`) โครงการตามโหมดที่เลือกใน Context |

### แผนภาพสถาปัตยกรรมและการไหลของข้อมูล (Architecture & Data Flow)

```mermaid
flowchart TD
    subgraph URLRouter["TanStack Router (URL State)"]
        SEARCH_PARAMS["URL Search Params (?page=1&pageSize=10&search=...&status=...&sortBy=...&sortOrder=...)"]
    end

    subgraph FeatureContext["Feature Context (contexts/)"]
        CTX["ProjectsContext (isCreateDialogOpen, editingProject, archiveTarget)"]
    end

    subgraph FeatureHooks["Feature Hooks (hooks/)"]
        H_SEARCH["useProjectsSearch"]
        H_TABLE["useProjectsTable"]
        H_TOOLBAR["useProjectsToolbar"]
        H_CREATE["useCreateProjectForm"]
        H_EDIT["useEditProjectForm"]
        H_ARCHIVE["useArchiveProjectDialog"]
    end

    subgraph ClientCaches["Client Caches (caches/projects/)"]
        Q_LIST["projectsListQueryOptions"]
        M_CREATE["useCreateProjectMutation"]
        M_UPDATE["useUpdateProjectMutation"]
        M_ARCHIVE["useArchiveProjectMutation"]
        M_RESTORE["useRestoreProjectMutation"]
    end

    SEARCH_PARAMS <-->|read & navigate| H_SEARCH
    H_SEARCH -->|search & updateSearch| H_TABLE
    H_SEARCH -->|search & updateSearch| H_TOOLBAR

    CTX -->|openEditDialog, requestArchiveToggle| H_TABLE
    CTX -->|openCreateDialog| H_TOOLBAR
    CTX -->|isCreateDialogOpen, closeCreateDialog| H_CREATE
    CTX -->|editingProject, closeEditDialog| H_EDIT
    CTX -->|archiveTarget, closeArchiveDialog| H_ARCHIVE

    H_TABLE -->|useQuery + keepPreviousData| Q_LIST
    H_TOOLBAR -->|useQuery (isFetching)| Q_LIST
    H_CREATE -->|mutateAsync| M_CREATE
    H_EDIT -->|mutateAsync| M_UPDATE
    H_ARCHIVE -->|mutateAsync (mode: archive)| M_ARCHIVE
    H_ARCHIVE -->|mutateAsync (mode: restore)| M_RESTORE
```

---

## 2. ทฤษฎี ความสำคัญ และกฎสถาปัตยกรรมเฉพาะ Boundary นี้

### 2.1 กฎสถาปัตยกรรมจาก `.agents/rules/client.md`
1. **Screen และ Component เป็น Pure Presentation ห้ามมี Logic (`client.md` ข้อ 3)**:
   - State, Data Fetching, Data Transformation/Calculation, Event Handling และ UI Interaction ทั้งหมดต้องถูกห่อหุ้มอยู่ใน `features/**/hooks/*.ts`
2. **ป้องกันการเปลี่ยนรูป Prop Drilling (`client.md` ข้อ 4–5)**:
   - ออกแบบ Hook API ให้แต่ละ Component เรียกเฉพาะ Scope ที่ตนรับผิดชอบโดยตรง เช่น `<ProjectsToolbar />` เรียก `useProjectsToolbar()`, `<ProjectsTable />` เรียก `useProjectsTable()`, `<CreateProjectDialog />` เรียก `useCreateProjectForm()`
   - ห้ามสร้าง God Hook ตัวเดียวแล้วส่งค่าผ่าน Props ลงไปยังลูกๆ
3. **Single Responsibility & High Cohesion (`client.md` ข้อ 6–7)**:
   - แยก 1 Hook ต่อ 1 ขอบเขตงานที่ชัดเจน (Search URL State, Table State, Toolbar Filter/Debounce, Create Form, Edit Form, Archive/Restore Confirmation) เพื่อให้อ่านง่าย ทดสอบแยกส่วนได้ และลด Re-render Cascade ที่ไม่จำเป็น

### 2.2 การซิงก์สถานะของตารางเข้ากับ URL Search Params (`useProjectsSearch` & `useProjectsTable`)
ตารางรายการโครงการ (`ProjectsTable`) รองรับการทำงานแบบ **Server-Side Pagination, Filtering และ Sorting เต็มรูปแบบ** โดยมีสถานะหลัก 6 ตัวแปรที่ถูกนิยามไว้ใน `projectsSearchSchema`:
- `page`: หน้าปัจจุบัน (เริ่มที่ `1`)
- `pageSize`: จำนวนรายการต่อหน้า (ค่าเริ่มต้น `10`)
- `search`: คำค้นหารหัส (`key`) หรือชื่อโครงการ (`name`)
- `status`: ตัวกรองสถานะ (`"all"` | `"active"` | `"archived"`)
- `sortBy`: คอลัมน์ที่ใช้เรียงลำดับ (`"key"` | `"name"` | `"status"` | `"updatedAt"` | `"createdAt"`)
- `sortOrder`: ทิศทางการเรียงลำดับ (`"asc"` | `"desc"`)

**ทำไมต้องเก็บสถานะเหล่านี้ไว้ใน URL Search Params แทนที่จะใช้ `useState` ภายในตาราง?**
1. **Bookmarkable & Shareable URL**: ผู้ใช้สามารถคัดลอกลิงก์หน้าปัจจุบันที่มีตัวกรองและการเรียงลำดับ (เช่น `/projects?status=archived&sortBy=name&sortOrder=asc&page=2`) ส่งให้เพื่อนร่วมทีมเปิดดูหน้าเดียวกันได้ทันที
2. **Refresh & Back/Forward Resilience**: เมื่อผู้ใช้กดปุ่ม Refresh บนเบราว์เซอร์ หรือคลิกเข้าไปดูรายละเอียดโครงการแล้วกดปุ่ม Back กลับมา ตารางจะยังคงอยู่ที่หน้าเดิม คำค้นหาเดิม และการเรียงลำดับเดิมเสมอ
3. **การแปลงค่าระหว่าง URL (1-based) กับ TanStack Table (0-based)**:
   - ใน URL เราเก็บ `page` เริ่มต้นที่ `1` เพื่อให้มนุษย์อ่านเข้าใจง่าย (`?page=1`)
   - แต่ `PaginationState` ของ TanStack Table ใช้ `pageIndex` เริ่มต้นที่ `0`
   - ดังนั้นใน `useProjectsTable` เราจึงแปลงค่าขาเข้าด้วย `pageIndex: Math.max(0, search.page - 1)` และแปลงค่าขาออกใน `onPaginationChange` กลับเป็น `page: isPageSizeChanged ? 1 : next.pageIndex + 1` (หากเปลี่ยนจำนวนแถวต่อหน้า `pageSize` จะรีเซ็ตกลับไปหน้า `1` เสมอ)
4. **การแปลงค่าระหว่าง URL (`sortBy`, `sortOrder`) กับ `SortingState` ของ TanStack Table**:
   - ขาเข้า: แปลง `search.sortBy` และ `search.sortOrder` เป็น `[{ id: search.sortBy, desc: search.sortOrder === "desc" }]`
   - ขาออก (`onSortingChange`): คำนวณสถานะถัดไปด้วย `functionalUpdate(updater, sorting)` แล้วตรวจสอบความถูกต้องของชื่อคอลัมน์ผ่าน `projectSortFieldSchema.safeParse(firstSort.id)` ก่อนสั่ง `updateSearch({ sortBy, sortOrder, page: 1 })` (ทุกครั้งที่เปลี่ยนการเรียงลำดับจะรีเซ็ตกลับไปหน้า `1`)

---

## 3. ลงมือเขียนโค้ด (Step-by-Step Implementation)

### 3.1 ไฟล์ `src/client/features/projects/contexts/projects.context.tsx`

สร้าง Context สำหรับประสานงานการเปิด/ปิด Dialog ทั้ง 3 ตัว (`CreateProjectDialog`, `EditProjectDialog`, `ArchiveProjectDialog`) โดยที่ปุ่มกดใน Toolbar หรือปุ่มจัดการในแต่ละแถวของ Table สามารถสั่งเปิด Dialog พร้อมส่งข้อมูลโครงการเป้าหมายผ่าน Context ได้โดยตรง:

```tsx
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import type { ProjectListItemDto } from "#/shared/schemas/project.schema";

export interface ArchiveDialogTarget {
	readonly project: ProjectListItemDto;
	readonly mode: "archive" | "restore";
}

interface ProjectsContextValue {
	isCreateDialogOpen: boolean;
	editingProject: ProjectListItemDto | null;
	archiveTarget: ArchiveDialogTarget | null;
	openCreateDialog: () => void;
	closeCreateDialog: () => void;
	openEditDialog: (project: ProjectListItemDto) => void;
	closeEditDialog: () => void;
	requestArchiveToggle: (
		project: ProjectListItemDto,
		mode: "archive" | "restore",
	) => void;
	closeArchiveDialog: () => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingProject, setEdittingProject] =
		useState<ProjectListItemDto | null>(null);
	const [archiveTarget, setArchiveTarget] =
		useState<ArchiveDialogTarget | null>(null);

	const value: ProjectsContextValue = {
		isCreateDialogOpen,
		editingProject,
		archiveTarget,
		openCreateDialog: () => setIsCreateDialogOpen(true),
		closeCreateDialog: () => setIsCreateDialogOpen(false),
		openEditDialog: (project) => setEdittingProject(project),
		closeEditDialog: () => setEdittingProject(null),
		requestArchiveToggle: (project, mode) =>
			setArchiveTarget({ project, mode }),
		closeArchiveDialog: () => setArchiveTarget(null),
	};

	return (
		<ProjectsContext.Provider value={value}>
			{children}
		</ProjectsContext.Provider>
	);
}

export function useProjectsContext(): ProjectsContextValue {
	const ctx = useContext(ProjectsContext);
	if (!ctx) {
		throw new Error(
			"useProjectsContext must be used inside <ProjectsProvider>",
		);
	}
	return ctx;
}
```

**คำอธิบายโค้ด:**
- `isCreateDialogOpen`: เก็บสถานะเปิด/ปิดกล่องสร้างโครงการใหม่
- `editingProject`: เก็บข้อมูล `ProjectListItemDto` ของแถวที่ผู้ใช้คลิกปุ่ม "แก้ไข" (หากเป็น `null` แปลว่ากล่องแก้ไขปิดอยู่)
- `archiveTarget`: เก็บทั้งข้อมูล `project` และ `mode` (`"archive"` หรือ `"restore"`) เพื่อให้กล่องยืนยัน `ArchiveProjectDialog` ปรับข้อความและเลือกเรียก Mutation ได้ถูกตัว

---

### 3.2 ไฟล์ `src/client/features/projects/hooks/use-projects-search.ts`

สร้าง Hook สำหรับอ่านและแก้ไข URL Search Params ของหน้า `/projects`:

```typescript
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";
import type { ProjectsSearch } from "#/shared/schemas/project.schema";
import { projectsSearchSchema } from "#/shared/schemas/project.schema";

export function useProjectsSearch() {
	const navigate = useNavigate();
	const rawSearch = useSearch({ strict: false });
	const search = projectsSearchSchema.parse(rawSearch);

	const updateSearch = useCallback(
		(patch: Partial<ProjectsSearch>) => {
			void navigate({
				to: "/projects",
				search: (prev) => ({
					...projectsSearchSchema.parse(prev),
					...patch,
				}),
			});
		},
		[navigate],
	);

	return {
		search,
		updateSearch,
	};
}
```

**คำอธิบายโค้ด:**
- ใช้ `useSearch({ strict: false })` ร่วมกับ `projectsSearchSchema.parse(rawSearch)` เพื่อรับประกันว่าค่า `search` ที่ได้จะมี Type เป็น `ProjectsSearch` พร้อมค่า Default ครบทุกฟิลด์เสมอ
- `updateSearch` รับเฉพาะฟิลด์ที่ต้องการเปลี่ยน (`Partial<ProjectsSearch>`) แล้วสั่ง `navigate({ to: "/projects", search: ... })` เพื่อผสานค่าใหม่เข้ากับ Search Params เดิมใน URL

---

### 3.3 ไฟล์ `src/client/features/projects/hooks/use-projects-table.ts`

สร้าง Hook สำหรับควบคุมตารางรายการโครงการแบบ Server-Side:

```typescript
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
	OnChangeFn,
	PaginationState,
	SortingState,
} from "@tanstack/react-table";
import { functionalUpdate, useTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { projectsListQueryOptions } from "#/client/caches/projects/queries/projects.query";
import {
	createServerColumnHelper,
	serverTableFeatures,
} from "#/client/shared/components/app-data-table";
import type { ProjectListItemDto } from "#/shared/schemas/project.schema";
import { projectSortFieldSchema } from "#/shared/schemas/project.schema";
import { useProjectsContext } from "../contexts/projects.context";
import { useProjectsSearch } from "./use-projects-search";

const projectColumnHelper = createServerColumnHelper<ProjectListItemDto>();

const projectTableColumns = projectColumnHelper.columns([
	projectColumnHelper.accessor("key", {
		header: "Key",
		enableSorting: true,
	}),
	projectColumnHelper.accessor("name", {
		header: "ชื่อโปรเจกต์",
		enableSorting: true,
	}),
	projectColumnHelper.accessor("status", {
		header: "สถานะ",
		enableSorting: true,
	}),
	projectColumnHelper.accessor("memberCount", {
		header: "สมาชิก",
		enableSorting: false,
	}),
	projectColumnHelper.accessor("taskCount", {
		header: "งานทั้งหมด",
		enableSorting: false,
	}),
	projectColumnHelper.accessor("myRoleName", {
		header: "บทบาทของฉัน",
		enableSorting: false,
	}),
	projectColumnHelper.accessor("updatedAt", {
		header: "อัปเดตล่าสุด",
		enableSorting: true,
	}),
	projectColumnHelper.display({
		id: "actions",
		header: "จัดการ",
		enableSorting: false,
	}),
]);

export function useProjectsTable() {
	const { search, updateSearch } = useProjectsSearch();
	const { openEditDialog, requestArchiveToggle } = useProjectsContext();

	const { data, isPending } = useQuery({
		...projectsListQueryOptions(search),
		placeholderData: keepPreviousData,
	});

	const pagination: PaginationState = useMemo(
		() => ({
			pageIndex: Math.max(0, search.page - 1),
			pageSize: search.pageSize,
		}),
		[search.page, search.pageSize],
	);

	const sorting: SortingState = useMemo(
		() => [
			{
				id: search.sortBy,
				desc: search.sortOrder === "desc",
			},
		],
		[search.sortBy, search.sortOrder],
	);

	const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
		const next = functionalUpdate(updater, pagination);
		const isPageSizeChanged = next.pageSize !== pagination.pageSize;

		updateSearch({
			page: isPageSizeChanged ? 1 : next.pageIndex + 1,
			pageSize: next.pageSize,
		});
	};

	const onSortingChange: OnChangeFn<SortingState> = (updater) => {
		const next = functionalUpdate(updater, sorting);
		const firstSort = next[0];

		if (!firstSort) {
			updateSearch({
				sortBy: "updatedAt",
				sortOrder: "desc",
				page: 1,
			});
			return;
		}

		const parsedField = projectSortFieldSchema.safeParse(firstSort.id);
		if (!parsedField.success) {
			return;
		}

		updateSearch({
			sortBy: parsedField.data,
			sortOrder: firstSort.desc ? "desc" : "asc",
			page: 1,
		});
	};

	const table = useTable({
		features: serverTableFeatures,
		columns: projectTableColumns,
		data: data?.items ?? [],
		rowCount: data?.total ?? 0,
		manualPagination: true,
		manualSorting: true,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange,
		onSortingChange,
		getRowId: (row) => row.id,
	});

	return {
		table,
		columnCount: projectTableColumns.length,
		isPending,
		openEditDialog,
		requestArchiveToggle,
	};
}
```

**คำอธิบายโค้ด:**
- นิยามคอลัมน์ทั้ง 8 คอลัมน์ด้วย `createServerColumnHelper<ProjectListItemDto>()` โดยเปิด `enableSorting: true` เฉพาะคอลัมน์ที่ Backend รองรับการเรียงลำดับ (`key`, `name`, `status`, `updatedAt`)
- ดึงข้อมูลด้วย `useQuery({ ...projectsListQueryOptions(search), placeholderData: keepPreviousData })` เพื่อให้ระหว่างเปลี่ยนหน้าหรือเรียงลำดับใหม่ ตารางยังคงแสดงข้อมูลชุดเดิมโดยไม่กระพริบ
- ตั้งค่า `manualPagination: true`, `manualSorting: true` และส่ง `rowCount: data?.total ?? 0` เข้าสู่ `useTable` เพื่อให้ TanStack Table คำนวณจำนวนหน้าทั้งหมดจากฐานข้อมูลฝั่ง Server

---

### 3.4 ไฟล์ `src/client/features/projects/hooks/use-projects-toolbar.ts`

สร้าง Hook สำหรับควบคุมแถบค้นหา ตัวกรองสถานะ และปุ่มสร้างโครงการ:

```typescript
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { projectsListQueryOptions } from "#/client/caches/projects/queries/projects.query";
import { useSession } from "#/client/features/auth/hooks/use-session";
import { projectStatusFilterSchema } from "#/shared/schemas/project.schema";
import { useProjectsContext } from "../contexts/projects.context";
import { useProjectsSearch } from "./use-projects-search";

export function useProjectsToolbar() {
	const { session } = useSession();
	const { openCreateDialog } = useProjectsContext();
	const { search, updateSearch } = useProjectsSearch();
	const [searchInput, setSearchInput] = useState(search.search);

	const { isFetching } = useQuery({
		...projectsListQueryOptions(search),
		placeholderData: keepPreviousData,
	});

	const canCreateProject =
		session?.user.systemPermissions.includes("project:create") ?? false;
	useEffect(() => {
		setSearchInput(search.search);
	}, [search.search]);

	useEffect(() => {
		const trimmed = searchInput.trim();
		if (trimmed === search.search) {
			return;
		}

		const timer = setTimeout(() => {
			updateSearch({ search: trimmed, page: 1 });
		}, 300);

		return () => clearTimeout(timer);
	}, [searchInput, search.search, updateSearch]);

	const handleClearSearch = () => {
		setSearchInput("");
		if (search.search !== "") {
			updateSearch({ search: "", page: 1 });
		}
	};

	const handleStatusChange = (nextValue: unknown) => {
		const parsed = projectStatusFilterSchema.safeParse(nextValue);
		if (!parsed.success || parsed.data === search.status) {
			return;
		}
		updateSearch({ status: parsed.data, page: 1 });
	};

	return {
		searchInput,
		status: search.status,
		isFetching,
		canCreateProject,
		setSearchInput,
		handleClearSearch,
		handleStatusChange,
		openCreateDialog,
	};
}
```

**คำอธิบายโค้ด:**
- **Debounced Search (300ms)**: แยก Local State `searchInput` สำหรับรับการพิมพ์แบบทันทีทันใด และใช้ `useEffect` ตั้งเวลา `setTimeout` 300 มิลลิวินาทีก่อนสั่ง `updateSearch({ search: trimmed, page: 1 })` เพื่อไม่ให้ยิง Request ทุกครั้งที่กดคีย์บอร์ดทีละตัวอักษร
- **Permission Check (`canCreateProject`)**: ตรวจสอบจาก `session?.user.systemPermissions.includes("project:create")` เพื่อซ่อนหรือแสดงปุ่ม "สร้างโครงการ" ตามสิทธิ์จริงของผู้ใช้
- **Background Loading Indicator (`isFetching`)**: อ่านสถานะ `isFetching` จาก Query เดียวกับตารางเพื่อนำไปแสดงไอคอนหมุน (`Loader2`) บนแถบเครื่องมือขณะกำลังโหลดข้อมูลหน้าใหม่

---

### 3.5 ไฟล์ `src/client/features/projects/hooks/use-create-project-form.ts`

สร้าง Hook สำหรับจัดการฟอร์มสร้างโครงการใหม่ใน Dialog:

```typescript
import { useCreateProjectMutation } from "#/client/caches/projects/mutates/create-project.mutate";
import { useAppForm } from "#/client/shared/components/app-form";
import { createProjectInputSchema } from "#/shared/schemas/project.schema";
import { useProjectsContext } from "../contexts/projects.context";

export function useCreateProjectForm() {
	const { isCreateDialogOpen, closeCreateDialog } = useProjectsContext();
	const createMutation = useCreateProjectMutation();

	const form = useAppForm({
		defaultValues: {
			key: "",
			name: "",
			description: "",
		},
		validators: {
			onBlur: createProjectInputSchema,
			onSubmit: createProjectInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await createMutation.mutateAsync(value);
				form.reset();
				closeCreateDialog();
			} catch {
				return;
			}
		},
	});

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			form.reset();
			closeCreateDialog();
		}
	};

	return {
		isOpen: isCreateDialogOpen,
		handleOpenChange,
		form,
	};
}
```

**คำอธิบายโค้ด:**
- ใช้ `useAppForm` ร่วมกับ `createProjectInputSchema` จาก `shared/schemas/project.schema` เพื่อตรวจสอบความถูกต้องทั้งตอน `onBlur` และ `onSubmit`
- เมื่อ `createMutation.mutateAsync(value)` สำเร็จ จะทำการ `form.reset()` ล้างค่าในฟอร์มและปิด Dialog ทันที

---

### 3.6 ไฟล์ `src/client/features/projects/hooks/use-edit-project-form.ts`

สร้าง Hook สำหรับจัดการฟอร์มแก้ไขโครงการ:

```typescript
import { useEffect } from "react";
import { useUpdateProjectMutation } from "#/client/caches/projects/mutates/update-project.mutate";
import { useAppForm } from "#/client/shared/components/app-form";
import { updateProjectInputSchema } from "#/shared/schemas/project.schema";
import { useProjectsContext } from "../contexts/projects.context";

export function useEditProjectForm() {
	const { editingProject, closeEditDialog } = useProjectsContext();
	const updateMutation = useUpdateProjectMutation();

	const form = useAppForm({
		defaultValues: {
			projectId: editingProject?.id ?? "",
			name: editingProject?.name ?? "",
			description: editingProject?.description ?? "",
		},
		validators: {
			onBlur: updateProjectInputSchema,
			onSubmit: updateProjectInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await updateMutation.mutateAsync(value);
				closeEditDialog();
			} catch {
				return;
			}
		},
	});

	useEffect(() => {
		if (!editingProject) {
			return;
		}
		form.reset({
			projectId: editingProject.id,
			name: editingProject.name,
			description: editingProject.description,
		});
	}, [editingProject, form]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeEditDialog();
		}
	};

	return {
		editingProject,
		handleOpenChange,
		form,
	};
}
```

**คำอธิบายโค้ด:**
- ใช้ `useEffect` ดักจับเมื่อ `editingProject` เปลี่ยนแปลง (เมื่อผู้ใช้คลิกปุ่มแก้ไขของแถวใดๆ) แล้วสั่ง `form.reset({ projectId, name, description })` เพื่อเติมข้อมูลปัจจุบันของโครงการนั้นลงในฟอร์มทันที

---

### 3.7 ไฟล์ `src/client/features/projects/hooks/use-archive-project-dialog.ts`

สร้าง Hook สำหรับควบคุมกล่องยืนยันการเก็บถาวร (`archive`) และการกู้คืน (`restore`) โครงการ:

```typescript
import { useArchiveProjectMutation } from "#/client/caches/projects/mutates/archive-project.mutate";
import { useRestoreProjectMutation } from "#/client/caches/projects/mutates/restore-project.mutate";
import { useProjectsContext } from "../contexts/projects.context";

export function useArchiveProjectDialog() {
	const { archiveTarget, closeArchiveDialog } = useProjectsContext();
	const archiveMutation = useArchiveProjectMutation();
	const restoreMutation = useRestoreProjectMutation();

	const isSubmitting = archiveMutation.isPending || restoreMutation.isPending;

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeArchiveDialog();
		}
	};

	const handleConfirm = async () => {
		if (!archiveTarget) {
			return;
		}

		try {
			if (archiveTarget.mode === "archive") {
				await archiveMutation.mutateAsync({
					projectId: archiveTarget.project.id,
				});
			} else {
				await restoreMutation.mutateAsync({
					projectId: archiveTarget.project.id,
				});
			}
			closeArchiveDialog();
		} catch {
			return;
		}
	};
	return {
		archiveTarget,
		isSubmitting,
		handleOpenChange,
		handleConfirm,
	};
}
```

**คำอธิบายโค้ด:**
- ตรวจสอบ `archiveTarget.mode` ว่าต้องการ `"archive"` หรือ `"restore"` แล้วเลือกเรียก `archiveMutation.mutateAsync` หรือ `restoreMutation.mutateAsync` ตามโหมดนั้น
- คำนวณ `isSubmitting` จากสถานะ `isPending` ของทั้งสอง Mutation เพื่อป้องกันการกดปุ่มซ้ำระหว่างรอ Server ตอบกลับ

---

## 4. การตรวจสอบความถูกต้องและ Git Commit (Verification & Commit)

ตรวจสอบความถูกต้องของโค้ดและ Type ทั้งหมดด้วยคำสั่ง:

```bash
bun run typecheck
bun run format
bun run check
```

จากนั้นทำการ Commit ไฟล์ Context และ Hooks ทั้ง 7 ไฟล์ใน Step นี้:

```bash
git add src/client/features/projects/contexts/ src/client/features/projects/hooks/
git commit -m "milestone-5.frontend.step-2: Feature Projects Context & Server-Side Table/Form Hooks"
```
