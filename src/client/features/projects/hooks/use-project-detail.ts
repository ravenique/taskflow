import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { projectDetailQueryOptions } from "#/client/caches/projects/queries/project-detail.query";
import type { ProjectPermissionCode } from "#/shared/schemas/rbac.schema";
import { useProjectId } from "./use-project-id";

export function useProjectDetail() {
	const projectId = useProjectId();
	const { data: project, isPending } = useQuery({
		...projectDetailQueryOptions(projectId),
		enabled: Boolean(projectId),
	});

	const myPermissions = project?.myPermissions ?? [];

	const can = useCallback(
		(permission: ProjectPermissionCode) => myPermissions.includes(permission),
		[myPermissions],
	);

	return {
		projectId,
		project: project ?? null,
		isPending,
		isArchived: project?.status === "archived",
		myRole: project?.myRole ?? null,
		myPermissions,
		can,
	};
}
