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
