import { useParams } from "@tanstack/react-router";

export function useTaskId(): string {
	const params = useParams({ strict: false });
	return "taskId" in params && typeof params.taskId === "string"
		? params.taskId
		: "";
}
