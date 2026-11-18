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
