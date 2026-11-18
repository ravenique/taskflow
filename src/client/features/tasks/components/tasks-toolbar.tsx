import { Loader2, Lock, Plus, RotateCcw, Search, X } from "lucide-react";
import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import { Input } from "#/client/shared/shadcn/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/client/shared/shadcn/components/ui/select";
import { useTasksToolbar } from "../hooks/use-tasks-toolbar";

export function TasksToolbar() {
	const {
		searchInput,
		status,
		priority,
		assigneeFilter,
		statusOptions,
		priorityOptions,
		assigneeFilterOptions,
		hasActiveFilters,
		isFetching,
		isArchived,
		canCreateTask,
		setSearchInput,
		handleClearSearch,
		handleStatusChange,
		handlePriorityChange,
		handleAssigneeFilterChange,
		handleResetFilters,
		openCreateDialog,
	} = useTasksToolbar();

	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div className="flex flex-wrap items-center gap-2.5">
				<div className="flex w-60 items-center gap-1.5">
					<Search
						className="size-4 shrink-0 text-muted-foreground"
						aria-hidden="true"
					/>
					<Input
						type="search"
						value={searchInput}
						placeholder="ค้นหารหัสหรือหัวข้องาน..."
						aria-label="ค้นหางาน"
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

				<Select
					items={statusOptions}
					value={status}
					onValueChange={handleStatusChange}
				>
					<SelectTrigger size="sm" aria-label="กรองตามสถานะ">
						<SelectValue />
					</SelectTrigger>
					<SelectContent alignItemWithTrigger={false}>
						{statusOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					items={priorityOptions}
					value={priority}
					onValueChange={handlePriorityChange}
				>
					<SelectTrigger size="sm" aria-label="กรองตามระดับความสำคัญ">
						<SelectValue />
					</SelectTrigger>
					<SelectContent alignItemWithTrigger={false}>
						{priorityOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					items={assigneeFilterOptions}
					value={assigneeFilter}
					onValueChange={handleAssigneeFilterChange}
				>
					<SelectTrigger size="sm" aria-label="กรองตามผู้รับผิดชอบ">
						<SelectValue />
					</SelectTrigger>
					<SelectContent alignItemWithTrigger={false}>
						{assigneeFilterOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{hasActiveFilters ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleResetFilters}
					>
						<RotateCcw aria-hidden="true" />
						<span>ล้างตัวกรอง</span>
					</Button>
				) : null}

				{isFetching ? (
					<Loader2
						className="size-4 animate-spin text-muted-foreground"
						aria-hidden="true"
					/>
				) : null}
			</div>

			<div className="flex items-center gap-2">
				{isArchived ? (
					<Badge variant="secondary">
						<Lock aria-hidden="true" />
						<span>เก็บถาวรแล้ว</span>
					</Badge>
				) : null}
				{canCreateTask ? (
					<Button type="button" size="sm" onClick={openCreateDialog}>
						<Plus aria-hidden="true" />
						<span>สร้างงานใหม่</span>
					</Button>
				) : null}
			</div>
		</div>
	);
}
