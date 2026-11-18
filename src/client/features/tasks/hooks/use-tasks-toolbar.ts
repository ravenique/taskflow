import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { projectMembersQueryOptions } from "#/client/caches/projects/queries/project-members.query";
import { tasksListQueryOptions } from "#/client/caches/tasks/queries/tasks.query";
import { useProjectDetail } from "#/client/features/projects/hooks/use-project-detail";
import {
	TASK_PRIORITY_FILTER_OPTIONS,
	TASK_STATUS_FILTER_OPTIONS,
} from "#/client/shared/helpers/task-display";
import {
	taskPriorityFilterSchema,
	taskStatusFilterSchema,
} from "#/shared/schemas/task.schema";
import { useTasksListContext } from "../contexts/tasks-list.context";
import { useTasksSearch } from "./use-tasks-search";

export function useTasksToolbar() {
	const { projectId, search, updateSearch } = useTasksSearch();
	const { isArchived, can } = useProjectDetail();
	const { openCreateDialog } = useTasksListContext();
	const [searchInput, setSearchInput] = useState(search.search);

	const { isFetching } = useQuery({
		...tasksListQueryOptions(projectId, search),
		enabled: Boolean(projectId),
		placeholderData: keepPreviousData,
	});

	const { data: membersData } = useQuery({
		...projectMembersQueryOptions(projectId),
		enabled: Boolean(projectId),
	});

	const assigneeFilterOptions = useMemo(() => {
		const memberOptions = (membersData?.members ?? []).map((member) => ({
			label: member.userName,
			value: member.userId,
		}));

		return [
			{ label: "ผู้รับผิดชอบทั้งหมด", value: "all" },
			{ label: "ยังไม่มอบหมาย (Unassigned)", value: "unassigned" },
			...memberOptions,
		];
	}, [membersData]);

	const canCreateTask = can("task:create") && !isArchived;

	const hasActiveFilters =
		search.search !== "" ||
		search.status !== "all" ||
		search.priority !== "all" ||
		search.assigneeFilter !== "all";

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

	const handleStatusChange = (nextValue: string | null) => {
		const parsed = taskStatusFilterSchema.safeParse(nextValue);
		if (!parsed.success || parsed.data === search.status) {
			return;
		}
		updateSearch({ status: parsed.data, page: 1 });
	};

	const handlePriorityChange = (nextValue: string | null) => {
		const parsed = taskPriorityFilterSchema.safeParse(nextValue);
		if (!parsed.success || parsed.data === search.priority) {
			return;
		}
		updateSearch({ priority: parsed.data, page: 1 });
	};

	const handleAssigneeFilterChange = (nextValue: string | null) => {
		if (!nextValue || nextValue === search.assigneeFilter) {
			return;
		}
		updateSearch({ assigneeFilter: nextValue, page: 1 });
	};

	const handleResetFilters = () => {
		setSearchInput("");
		updateSearch({
			search: "",
			status: "all",
			priority: "all",
			assigneeFilter: "all",
			page: 1,
		});
	};

	return {
		searchInput,
		status: search.status,
		priority: search.priority,
		assigneeFilter: search.assigneeFilter,
		statusOptions: TASK_STATUS_FILTER_OPTIONS,
		priorityOptions: TASK_PRIORITY_FILTER_OPTIONS,
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
	};
}
