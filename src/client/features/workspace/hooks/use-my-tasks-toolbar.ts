import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { myAssignedTasksQueryOptions } from "#/client/caches/workspace/queries/my-assigned-tasks.query";
import {
	TASK_PRIORITY_FILTER_OPTIONS,
	TASK_STATUS_FILTER_OPTIONS,
} from "#/client/shared/helpers/task-display";
import {
	taskPriorityFilterSchema,
	taskStatusFilterSchema,
} from "#/shared/schemas/task.schema";
import { useWorkspaceSearch } from "./use-workspace-search";

export function useMyTasksToolbar() {
	const { search, updateSearch } = useWorkspaceSearch();
	const [searchInput, setSearchInput] = useState(search.search);

	const { isFetching } = useQuery({
		...myAssignedTasksQueryOptions(search),
		placeholderData: keepPreviousData,
	});

	const hasActiveFilters =
		search.search !== "" ||
		search.status !== "all" ||
		search.priority !== "all";

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

	const handleResetFilters = () => {
		setSearchInput("");
		updateSearch({
			search: "",
			status: "all",
			priority: "all",
			page: 1,
		});
	};

	return {
		searchInput,
		status: search.status,
		priority: search.priority,
		statusOptions: TASK_STATUS_FILTER_OPTIONS,
		priorityOptions: TASK_PRIORITY_FILTER_OPTIONS,
		hasActiveFilters,
		isFetching,
		setSearchInput,
		handleClearSearch,
		handleStatusChange,
		handlePriorityChange,
		handleResetFilters,
	};
}
