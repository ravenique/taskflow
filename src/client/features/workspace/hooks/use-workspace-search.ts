import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";
import type { MyTasksSearch } from "#/shared/schemas/workspace.schema";
import { myTasksSearchSchema } from "#/shared/schemas/workspace.schema";

export function useWorkspaceSearch() {
	const navigate = useNavigate();
	const rawSearch = useSearch({ strict: false });
	const search = myTasksSearchSchema.parse(rawSearch);

	const updateSearch = useCallback(
		(patch: Partial<MyTasksSearch>) => {
			void navigate({
				to: "/",
				search: (prev) => ({
					...myTasksSearchSchema.parse(prev),
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
