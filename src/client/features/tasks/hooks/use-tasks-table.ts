import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
	OnChangeFn,
	PaginationState,
	SortingState,
} from "@tanstack/react-table";
import { functionalUpdate, useTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { tasksListQueryOptions } from "#/client/caches/tasks/queries/tasks.query";
import {
	createServerColumnHelper,
	serverTableFeatures,
} from "#/client/shared/components/app-data-table";
import type { TaskListItemDto } from "#/shared/schemas/task.schema";
import { taskSortFieldSchema } from "#/shared/schemas/task.schema";
import { useTasksSearch } from "./use-tasks-search";

const taskColumnHelper = createServerColumnHelper<TaskListItemDto>();

const taskTableColumns = taskColumnHelper.columns([
	taskColumnHelper.accessor("code", {
		header: "รหัส",
		enableSorting: true,
	}),
	taskColumnHelper.accessor("title", {
		header: "หัวข้องาน",
		enableSorting: true,
	}),
	taskColumnHelper.accessor("status", {
		header: "สถานะ",
		enableSorting: true,
	}),
	taskColumnHelper.accessor("priority", {
		header: "ความสำคัญ",
		enableSorting: true,
	}),
	taskColumnHelper.accessor("assignee", {
		header: "ผู้รับผิดชอบ",
		enableSorting: false,
	}),
	taskColumnHelper.accessor("dueDate", {
		header: "วันครบกำหนด",
		enableSorting: true,
	}),
	taskColumnHelper.accessor("commentCount", {
		header: "ความคิดเห็น",
		enableSorting: false,
	}),
	taskColumnHelper.accessor("updatedAt", {
		header: "อัปเดตล่าสุด",
		enableSorting: true,
	}),
]);

export function useTasksTable() {
	const { projectId, search, updateSearch } = useTasksSearch();

	const { data, isPending } = useQuery({
		...tasksListQueryOptions(projectId, search),
		enabled: Boolean(projectId),
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

		const parsedField = taskSortFieldSchema.safeParse(firstSort.id);
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
		columns: taskTableColumns,
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
		columnCount: taskTableColumns.length,
		isPending,
	};
}
