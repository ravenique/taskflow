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
