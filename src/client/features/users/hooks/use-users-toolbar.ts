import { useQuery } from "@tanstack/react-query";
import { adminUsersQueryOptions } from "#/client/caches/users/queries/users.query";
import { useUsersAdminContext } from "../contexts/users-admin.context";

export function useUsersToolbar() {
	const { searchInput, debouncedSearch, setSearchInput } =
		useUsersAdminContext();
	const { data, isFetching } = useQuery(
		adminUsersQueryOptions(debouncedSearch),
	);

	return {
		searchInput,
		totalCount: data?.length ?? 0,
		isFetching,
		handleSearchChange: (value: string) => setSearchInput(value),
		handleClearSearch: () => setSearchInput(""),
	};
}
