import { useParams } from "@tanstack/react-router";

export function useProjectId(): string {
	const params = useParams({ strict: false });
	return "projectId" in params && typeof params.projectId === "string"
		? params.projectId
		: "";
}
