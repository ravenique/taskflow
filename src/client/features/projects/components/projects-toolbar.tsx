import { Loader2, Plus, Search, X } from "lucide-react";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import { Input } from "#/client/shared/shadcn/components/ui/input";
import {
	Tabs,
	TabsList,
	TabsTrigger,
} from "#/client/shared/shadcn/components/ui/tabs";
import { useProjectsToolbar } from "../hooks/use-projects-toolbar";

export function ProjectsToolbar() {
	const {
		searchInput,
		status,
		isFetching,
		canCreateProject,
		setSearchInput,
		handleClearSearch,
		handleStatusChange,
		openCreateDialog,
	} = useProjectsToolbar();

	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex w-64 items-center gap-2">
					<Search
						className="size-4 shrink-0 text-muted-foreground"
						aria-hidden="true"
					/>
					<Input
						type="search"
						value={searchInput}
						placeholder="ค้นหารหัสหรือชื่อโครงการ..."
						aria-label="ค้นหาโครงการ"
						onChange={(event) => setSearchInput(event.target.value)}
					/>
					{searchInput ? (
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label="ล้างคำค้นหา"
							onClick={handleClearSearch}
						>
							<X aria-hidden="true" />
						</Button>
					) : null}
				</div>

				<Tabs value={status} onValueChange={handleStatusChange}>
					<TabsList>
						<TabsTrigger value="all">ทั้งหมด</TabsTrigger>
						<TabsTrigger value="active">ใช้งานอยู่</TabsTrigger>
						<TabsTrigger value="archived">เก็บถาวร</TabsTrigger>
					</TabsList>
				</Tabs>

				{isFetching ? (
					<Loader2
						className="size-4 animate-spin text-muted-foreground"
						aria-hidden="true"
					/>
				) : null}
			</div>

			{canCreateProject ? (
				<Button type="button" size="sm" onClick={openCreateDialog}>
					<Plus aria-hidden="true" />
					<span>สร้างโครงการ</span>
				</Button>
			) : null}
		</div>
	);
}
